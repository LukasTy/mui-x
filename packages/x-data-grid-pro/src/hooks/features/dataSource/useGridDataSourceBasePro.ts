'use client';
import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { isDeepEqual } from '@mui/x-internals/isDeepEqual';
import useLazyRef from '@mui/utils/useLazyRef';
import {
  GridDataSourceGroupNode,
  useGridSelector,
  GridGetRowsError,
  gridRowIdSelector,
  gridRowNodeSelector,
  GridRowModelUpdate,
  GridRowModel,
  gridRowTreeSelector,
  GridUpdateRowParams,
  GridRowId,
} from '@mui/x-data-grid';
import {
  gridRowGroupsToFetchSelector,
  useGridDataSourceBase,
  CacheChunkManager,
  gridGetRowsParamsSelector,
  DataSourceRowsUpdateStrategy,
  GridStrategyGroup,
  GridDataSourceBaseOptions,
} from '@mui/x-data-grid/internals';
import { warnOnce } from '@mui/x-internals/warning';
import { GridPrivateApiPro } from '../../../models/gridApiPro';
import { DataGridProProcessedProps } from '../../../models/dataGridProProps';
import { NestedDataManager, RequestStatus, getGroupKeys } from './utils';
import {
  GridDataSourceApiBasePro,
  GridDataSourceApiPro,
  GridDataSourcePrivateApiPro,
  GridGetRowsParamsPro,
  GridGetRowsResponsePro,
} from './models';
import { gridDataSourceErrorsSelector } from './gridDataSourceSelector';

export const INITIAL_STATE = {
  loading: {},
  errors: {},
};

export const useGridDataSourceBasePro = <Api extends GridPrivateApiPro>(
  apiRef: RefObject<Api>,
  props: DataGridProProcessedProps,
  options: GridDataSourceBaseOptions = {},
) => {
  const groupsToAutoFetch = useGridSelector(apiRef, gridRowGroupsToFetchSelector);
  const nestedDataManager = useLazyRef<NestedDataManager, void>(
    () => new NestedDataManager(apiRef),
  ).current;
  const scheduledGroups = React.useRef<number>(0);

  const clearDataSourceState = React.useCallback(() => {
    nestedDataManager.clear();
    scheduledGroups.current = 0;
    const dataSourceState = apiRef.current.state.dataSource;
    if (dataSourceState !== INITIAL_STATE) {
      apiRef.current.resetDataSourceState();
    }
    return null;
  }, [apiRef, nestedDataManager]);

  const handleEditRow = React.useCallback(
    (params: GridUpdateRowParams, updatedRow: GridRowModel) => {
      const groupKeys = getGroupKeys(gridRowTreeSelector(apiRef), params.rowId) as string[];
      apiRef.current.updateNestedRows([updatedRow], groupKeys);
      if (updatedRow && !isDeepEqual(updatedRow, params.previousRow)) {
        // Reset the outdated cache, only if the row is _actually_ updated
        apiRef.current.dataSource.cache.clear();
      }
    },
    [apiRef],
  );

  const { api, debouncedFetchRows, strategyProcessor, events, cacheChunkManager, cache } =
    useGridDataSourceBase(apiRef, props, {
      fetchRowChildren: nestedDataManager.queue,
      clearDataSourceState,
      handleEditRow,
      ...options,
    });

  const setStrategyAvailability = React.useCallback(() => {
    apiRef.current.setStrategyAvailability(
      GridStrategyGroup.DataSource,
      DataSourceRowsUpdateStrategy.Default,
      props.dataSource && !props.lazyLoading ? () => true : () => false,
    );
  }, [apiRef, props.dataSource, props.lazyLoading]);

  const onDataSourceErrorProp = props.onDataSourceError;

  const fetchRowChildren = React.useCallback<GridDataSourcePrivateApiPro['fetchRowChildren']>(
    async (id) => {
      const pipedParams = apiRef.current.unstable_applyPipeProcessors(
        'getRowsParams',
        {},
      ) as Partial<GridGetRowsParamsPro & { groupFields: string[] }>;
      if (!props.treeData && (pipedParams.groupFields?.length ?? 0) === 0) {
        nestedDataManager.clearPendingRequest(id);
        return;
      }
      const getRows = props.dataSource?.getRows;
      if (!getRows) {
        nestedDataManager.clearPendingRequest(id);
        return;
      }

      const rowNode = apiRef.current.getRowNode<GridDataSourceGroupNode>(id);
      if (!rowNode) {
        nestedDataManager.clearPendingRequest(id);
        return;
      }

      const fetchParams = {
        ...gridGetRowsParamsSelector(apiRef),
        ...pipedParams,
        groupKeys: rowNode.path,
      };

      const cacheKeys = cacheChunkManager.getCacheKeys(fetchParams);
      const responses = cacheKeys.map((cacheKey) => cache.get(cacheKey));
      const cachedData = responses.some((response) => response === undefined)
        ? undefined
        : CacheChunkManager.mergeResponses(responses as GridGetRowsResponsePro[]);

      if (cachedData !== undefined) {
        const rows = cachedData.rows;
        nestedDataManager.setRequestSettled(id);
        apiRef.current.updateNestedRows(rows, rowNode.path);
        if (cachedData.rowCount !== undefined) {
          apiRef.current.setRowCount(cachedData.rowCount);
        }
        apiRef.current.setRowChildrenExpansion(id, true);
        apiRef.current.dataSource.setChildrenLoading(id, false);
        return;
      }

      const existingError = gridDataSourceErrorsSelector(apiRef)[id] ?? null;
      if (existingError) {
        apiRef.current.dataSource.setChildrenFetchError(id, null);
      }

      try {
        const getRowsResponse = await getRows(fetchParams);
        if (!apiRef.current.getRowNode(id)) {
          // The row has been removed from the grid
          nestedDataManager.clearPendingRequest(id);
          return;
        }
        if (nestedDataManager.getRequestStatus(id) === RequestStatus.UNKNOWN) {
          apiRef.current.dataSource.setChildrenLoading(id, false);
          return;
        }
        nestedDataManager.setRequestSettled(id);

        const cacheResponses = cacheChunkManager.splitResponse(fetchParams, getRowsResponse);
        cacheResponses.forEach((response, key) => {
          cache.set(key, response);
        });

        if (getRowsResponse.rowCount !== undefined) {
          apiRef.current.setRowCount(getRowsResponse.rowCount);
        }
        // Remove existing outdated rows before setting the new ones
        const rowsToDelete: GridRowModelUpdate[] = [];
        getRowsResponse.rows.forEach((row) => {
          const rowId = gridRowIdSelector(apiRef, row);
          const treeNode = gridRowNodeSelector(apiRef, rowId);
          if (treeNode) {
            rowsToDelete.push({ id: rowId, _action: 'delete' });
          }
        });
        if (rowsToDelete.length > 0) {
          // TODO: Make this happen in a single pass by modifying the pre-processing of the rows
          apiRef.current.updateNestedRows(rowsToDelete, rowNode.path);
        }
        apiRef.current.updateNestedRows(getRowsResponse.rows, rowNode.path);
        apiRef.current.setRowChildrenExpansion(id, true);
      } catch (error) {
        const childrenFetchError = error as Error;
        apiRef.current.dataSource.setChildrenFetchError(id, childrenFetchError);
        if (typeof onDataSourceErrorProp === 'function') {
          onDataSourceErrorProp(
            new GridGetRowsError({
              message: childrenFetchError.message,
              params: fetchParams,
              cause: childrenFetchError,
            }),
          );
        } else if (process.env.NODE_ENV !== 'production') {
          warnOnce(
            [
              'MUI X: A call to `dataSource.getRows()` threw an error which was not handled because `onDataSourceError()` is missing.',
              'To handle the error pass a callback to the `onDataSourceError` prop, for example `<DataGrid onDataSourceError={(error) => ...} />`.',
              'For more detail, see https://mui.com/x/react-data-grid/server-side-data/#error-handling.',
            ],
            'error',
          );
        }
      } finally {
        apiRef.current.dataSource.setChildrenLoading(id, false);
        nestedDataManager.setRequestSettled(id);
      }
    },
    [
      nestedDataManager,
      cacheChunkManager,
      cache,
      onDataSourceErrorProp,
      apiRef,
      props.treeData,
      props.dataSource?.getRows,
    ],
  );

  const setChildrenLoading = React.useCallback<GridDataSourceApiBasePro['setChildrenLoading']>(
    (parentId, isLoading) => {
      apiRef.current.setState((state) => {
        if (!state.dataSource.loading[parentId] && isLoading === false) {
          return state;
        }
        const newLoadingState = { ...state.dataSource.loading };
        if (isLoading === false) {
          delete newLoadingState[parentId];
        } else {
          newLoadingState[parentId] = isLoading;
        }
        return {
          ...state,
          dataSource: {
            ...state.dataSource,
            loading: newLoadingState,
          },
        };
      });
    },
    [apiRef],
  );

  const setChildrenFetchError = React.useCallback<
    GridDataSourceApiBasePro['setChildrenFetchError']
  >(
    (parentId, error) => {
      apiRef.current.setState((state) => {
        const newErrorsState = { ...state.dataSource.errors };
        if (error === null && newErrorsState[parentId] !== undefined) {
          delete newErrorsState[parentId];
        } else {
          newErrorsState[parentId] = error;
        }
        return {
          ...state,
          dataSource: {
            ...state.dataSource,
            errors: newErrorsState,
          },
        };
      });
    },
    [apiRef],
  );

  const resetDataSourceState = React.useCallback<
    GridDataSourcePrivateApiPro['resetDataSourceState']
  >(() => {
    apiRef.current.setState((state) => {
      return {
        ...state,
        dataSource: INITIAL_STATE,
      };
    });
  }, [apiRef]);

  const removeChildrenRows = React.useCallback<GridDataSourcePrivateApiPro['removeChildrenRows']>(
    (parentId) => {
      const rowNode = gridRowNodeSelector(apiRef, parentId);
      if (!rowNode || rowNode.type !== 'group' || rowNode.children.length === 0) {
        return;
      }

      const removedRows: { id: GridRowId; _action: 'delete' }[] = [];
      const traverse = (nodeId: GridRowId) => {
        const node = gridRowNodeSelector(apiRef, nodeId);
        if (!node) {
          return;
        }

        if (node.type === 'group' && node.children.length > 0) {
          node.children.forEach(traverse);
        }
        removedRows.push({ id: nodeId, _action: 'delete' });
      };

      rowNode.children.forEach(traverse);

      if (removedRows.length > 0) {
        apiRef.current.updateNestedRows(removedRows, (rowNode as GridDataSourceGroupNode).path);
      }
    },
    [apiRef],
  );

  const dataSourceApi: GridDataSourceApiPro = {
    dataSource: {
      ...api.public.dataSource,
      setChildrenLoading,
      setChildrenFetchError,
    },
  };

  const dataSourcePrivateApi: GridDataSourcePrivateApiPro = {
    fetchRowChildren,
    resetDataSourceState,
    removeChildrenRows,
  };

  React.useEffect(() => {
    if (
      groupsToAutoFetch &&
      groupsToAutoFetch.length &&
      scheduledGroups.current < groupsToAutoFetch.length
    ) {
      const groupsToSchedule = groupsToAutoFetch.slice(scheduledGroups.current);
      nestedDataManager.queue(groupsToSchedule);
      scheduledGroups.current = groupsToAutoFetch.length;
    }
  }, [apiRef, nestedDataManager, groupsToAutoFetch]);

  return {
    api: { public: dataSourceApi, private: dataSourcePrivateApi },
    debouncedFetchRows,
    strategyProcessor,
    events,
    setStrategyAvailability,
    cacheChunkManager,
    cache,
  };
};
