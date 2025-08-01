import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { GridRowId, gridRowTreeSelector, gridColumnLookupSelector } from '@mui/x-data-grid-pro';
import {
  GridStrategyProcessor,
  useGridRegisterStrategyProcessor,
  createRowTree,
  updateRowTree,
  getVisibleRowsLookup,
  skipSorting,
  skipFiltering,
  GridRowsPartialUpdates,
  getParentPath,
  RowGroupingStrategy,
} from '@mui/x-data-grid-pro/internals';
import { DataGridPremiumProcessedProps } from '../../../models/dataGridPremiumProps';
import { getGroupingRules } from './gridRowGroupingUtils';
import { GridPrivateApiPremium } from '../../../models/gridApiPremium';
import { gridRowGroupingSanitizedModelSelector } from './gridRowGroupingSelector';

export const useGridDataSourceRowGroupingPreProcessors = (
  apiRef: RefObject<GridPrivateApiPremium>,
  props: Pick<
    DataGridPremiumProcessedProps,
    | 'disableRowGrouping'
    | 'rowGroupingColumnMode'
    | 'defaultGroupingExpansionDepth'
    | 'isGroupExpandedByDefault'
    | 'dataSource'
  >,
) => {
  const createRowTreeForRowGrouping = React.useCallback<GridStrategyProcessor<'rowTreeCreation'>>(
    (params) => {
      const getGroupKey = props.dataSource?.getGroupKey;
      if (!getGroupKey) {
        throw new Error('MUI X: No `getGroupKey` method provided with the dataSource.');
      }

      const getChildrenCount = props.dataSource?.getChildrenCount;
      if (!getChildrenCount) {
        throw new Error('MUI X: No `getChildrenCount` method provided with the dataSource.');
      }

      const sanitizedRowGroupingModel = gridRowGroupingSanitizedModelSelector(apiRef);
      const columnsLookup = gridColumnLookupSelector(apiRef);
      const groupingRules = getGroupingRules({
        sanitizedRowGroupingModel,
        columnsLookup,
      });
      apiRef.current.caches.rowGrouping.rulesOnLastRowTreeCreation = groupingRules;

      const getRowTreeBuilderNode = (rowId: GridRowId) => {
        const parentPath =
          (params.updates as GridRowsPartialUpdates).groupKeys ?? getParentPath(rowId, params);
        const leafKey = getGroupKey(params.dataRowIdToModelLookup[rowId]);
        return {
          id: rowId,
          path: [...parentPath, leafKey ?? rowId.toString()].map((key, i) => ({
            key,
            field: groupingRules[i]?.field ?? null,
          })),
          serverChildrenCount: getChildrenCount(params.dataRowIdToModelLookup[rowId]) ?? 0,
        };
      };

      if (params.updates.type === 'full') {
        return createRowTree({
          previousTree: params.previousTree,
          nodes: params.updates.rows.map(getRowTreeBuilderNode),
          defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
          isGroupExpandedByDefault: props.isGroupExpandedByDefault,
          groupingName: RowGroupingStrategy.DataSource,
        });
      }

      return updateRowTree({
        nodes: {
          inserted: (params.updates as GridRowsPartialUpdates).actions.insert.map(
            getRowTreeBuilderNode,
          ),
          modified: (params.updates as GridRowsPartialUpdates).actions.modify.map(
            getRowTreeBuilderNode,
          ),
          removed: (params.updates as GridRowsPartialUpdates).actions.remove,
        },
        previousTree: params.previousTree!,
        previousGroupsToFetch: params.previousGroupsToFetch,
        previousTreeDepth: params.previousTreeDepths!,
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
        isGroupExpandedByDefault: props.isGroupExpandedByDefault,
        groupingName: RowGroupingStrategy.DataSource,
      });
    },
    [apiRef, props.dataSource, props.defaultGroupingExpansionDepth, props.isGroupExpandedByDefault],
  );

  const filterRows = React.useCallback<GridStrategyProcessor<'filtering'>>(() => {
    const rowTree = gridRowTreeSelector(apiRef);

    return skipFiltering(rowTree);
  }, [apiRef]);

  const sortRows = React.useCallback<GridStrategyProcessor<'sorting'>>(() => {
    const rowTree = gridRowTreeSelector(apiRef);

    return skipSorting(rowTree);
  }, [apiRef]);

  useGridRegisterStrategyProcessor(
    apiRef,
    RowGroupingStrategy.DataSource,
    'rowTreeCreation',
    createRowTreeForRowGrouping,
  );
  useGridRegisterStrategyProcessor(apiRef, RowGroupingStrategy.DataSource, 'filtering', filterRows);
  useGridRegisterStrategyProcessor(apiRef, RowGroupingStrategy.DataSource, 'sorting', sortRows);
  useGridRegisterStrategyProcessor(
    apiRef,
    RowGroupingStrategy.DataSource,
    'visibleRowsLookupCreation',
    getVisibleRowsLookup,
  );
};
