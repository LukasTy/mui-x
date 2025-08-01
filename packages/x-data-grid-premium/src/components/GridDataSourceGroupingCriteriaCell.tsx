import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import composeClasses from '@mui/utils/composeClasses';
import {
  useGridPrivateApiContext,
  gridDataSourceErrorSelector,
  gridDataSourceLoadingIdSelector,
  gridRowSelector,
  vars,
} from '@mui/x-data-grid-pro/internals';
import {
  useGridSelector,
  getDataGridUtilityClass,
  GridRenderCellParams,
  GridGroupNode,
} from '@mui/x-data-grid-pro';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { DataGridPremiumProcessedProps } from '../models/dataGridPremiumProps';
import { GridPrivateApiPremium } from '../models/gridApiPremium';

type OwnerState = DataGridPremiumProcessedProps;

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['groupingCriteriaCell'],
    toggle: ['groupingCriteriaCellToggle'],
    loadingContainer: ['groupingCriteriaCellLoadingContainer'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

interface GridGroupingCriteriaCellProps extends GridRenderCellParams<any, any, any, GridGroupNode> {
  hideDescendantCount?: boolean;
}

interface GridGroupingCriteriaCellIconProps
  extends Pick<GridGroupingCriteriaCellProps, 'id' | 'field' | 'rowNode' | 'row'> {
  descendantCount: number;
}

function GridGroupingCriteriaCellIcon(props: GridGroupingCriteriaCellIconProps) {
  const apiRef = useGridPrivateApiContext() as RefObject<GridPrivateApiPremium>;
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  const { rowNode, id, field, descendantCount } = props;

  const isDataLoading = useGridSelector(apiRef, gridDataSourceLoadingIdSelector, id);
  const error = useGridSelector(apiRef, gridDataSourceErrorSelector, id);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!rowNode.childrenExpanded) {
      // always fetch/get from cache the children when the node is expanded
      apiRef.current.dataSource.fetchRows(id);
    } else {
      // Collapse the node and remove child rows from the grid
      apiRef.current.setRowChildrenExpansion(id, false);
      apiRef.current.removeChildrenRows(id);
    }
    apiRef.current.setCellFocus(id, field);
    event.stopPropagation();
  };

  const Icon = rowNode.childrenExpanded
    ? rootProps.slots.groupingCriteriaCollapseIcon
    : rootProps.slots.groupingCriteriaExpandIcon;

  if (isDataLoading) {
    return (
      <div className={classes.loadingContainer}>
        <rootProps.slots.baseCircularProgress size="1rem" color="inherit" />
      </div>
    );
  }

  return descendantCount === -1 || descendantCount > 0 ? (
    <rootProps.slots.baseIconButton
      size="small"
      onClick={handleClick}
      tabIndex={-1}
      aria-label={
        rowNode.childrenExpanded
          ? apiRef.current.getLocaleText('treeDataCollapse')
          : apiRef.current.getLocaleText('treeDataExpand')
      }
      {...rootProps?.slotProps?.baseIconButton}
    >
      <rootProps.slots.baseTooltip title={error?.message ?? null}>
        <rootProps.slots.baseBadge variant="dot" color="error" invisible={!error}>
          <Icon fontSize="inherit" />
        </rootProps.slots.baseBadge>
      </rootProps.slots.baseTooltip>
    </rootProps.slots.baseIconButton>
  ) : null;
}

export function GridDataSourceGroupingCriteriaCell(props: GridGroupingCriteriaCellProps) {
  const { id, field, rowNode, hideDescendantCount, formattedValue } = props;

  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const row = useGridSelector(apiRef, gridRowSelector, id);
  const classes = useUtilityClasses(rootProps);

  let descendantCount = 0;
  if (row) {
    descendantCount = rootProps.dataSource?.getChildrenCount?.(row) ?? 0;
  }

  let cellContent: React.ReactNode;

  const colDef = apiRef.current.getColumn(rowNode.groupingField!);
  if (typeof colDef?.renderCell === 'function') {
    cellContent = colDef.renderCell(props);
  } else if (typeof formattedValue !== 'undefined') {
    cellContent = <span>{formattedValue}</span>;
  } else {
    cellContent = <span>{rowNode.groupingKey}</span>;
  }

  return (
    <div
      className={classes.root}
      style={{
        marginLeft:
          rootProps.rowGroupingColumnMode === 'multiple'
            ? 0
            : `calc(var(--DataGrid-cellOffsetMultiplier) * ${vars.spacing(rowNode.depth)})`,
      }}
    >
      <div className={classes.toggle}>
        <GridGroupingCriteriaCellIcon
          id={id}
          field={field}
          rowNode={rowNode}
          row={row}
          descendantCount={descendantCount}
        />
      </div>
      {cellContent}
      {!hideDescendantCount && descendantCount > 0 ? (
        <span style={{ whiteSpace: 'pre' }}> ({descendantCount})</span>
      ) : null}
    </div>
  );
}
