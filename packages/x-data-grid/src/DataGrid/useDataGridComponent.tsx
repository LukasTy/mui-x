'use client';
import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { DataGridProcessedProps } from '../models/props/DataGridProps';
import { GridPrivateApiCommunity } from '../models/api/gridApiCommunity';
import { useGridInitialization } from '../hooks/core/useGridInitialization';
import { useGridVirtualizer } from '../hooks/core/useGridVirtualizer';
import { useGridInitializeState } from '../hooks/utils/useGridInitializeState';
import { useGridClipboard } from '../hooks/features/clipboard/useGridClipboard';
import {
  columnMenuStateInitializer,
  useGridColumnMenu,
} from '../hooks/features/columnMenu/useGridColumnMenu';
import { useGridColumns, columnsStateInitializer } from '../hooks/features/columns/useGridColumns';
import { densityStateInitializer, useGridDensity } from '../hooks/features/density/useGridDensity';
import { useGridCsvExport } from '../hooks/features/export/useGridCsvExport';
import { useGridPrintExport } from '../hooks/features/export/useGridPrintExport';
import { useGridFilter, filterStateInitializer } from '../hooks/features/filter/useGridFilter';
import { focusStateInitializer, useGridFocus } from '../hooks/features/focus/useGridFocus';
import { useGridKeyboardNavigation } from '../hooks/features/keyboardNavigation/useGridKeyboardNavigation';
import {
  useGridPagination,
  paginationStateInitializer,
} from '../hooks/features/pagination/useGridPagination';
import {
  useGridPreferencesPanel,
  preferencePanelStateInitializer,
} from '../hooks/features/preferencesPanel/useGridPreferencesPanel';
import { useGridEditing, editingStateInitializer } from '../hooks/features/editing/useGridEditing';
import { useGridRows, rowsStateInitializer } from '../hooks/features/rows/useGridRows';
import { useGridRowsPreProcessors } from '../hooks/features/rows/useGridRowsPreProcessors';
import { useGridParamsApi } from '../hooks/features/rows/useGridParamsApi';
import {
  rowSelectionStateInitializer,
  useGridRowSelection,
} from '../hooks/features/rowSelection/useGridRowSelection';
import { useGridRowSelectionPreProcessors } from '../hooks/features/rowSelection/useGridRowSelectionPreProcessors';
import { useGridSorting, sortingStateInitializer } from '../hooks/features/sorting/useGridSorting';
import { useGridScroll } from '../hooks/features/scroll/useGridScroll';
import { useGridEvents } from '../hooks/features/events/useGridEvents';
import {
  dimensionsStateInitializer,
  useGridDimensions,
} from '../hooks/features/dimensions/useGridDimensions';
import { rowsMetaStateInitializer, useGridRowsMeta } from '../hooks/features/rows/useGridRowsMeta';
import { useGridStatePersistence } from '../hooks/features/statePersistence/useGridStatePersistence';
import { useGridColumnSpanning } from '../hooks/features/columns/useGridColumnSpanning';
import {
  useGridColumnGrouping,
  columnGroupsStateInitializer,
} from '../hooks/features/columnGrouping/useGridColumnGrouping';
import {
  useGridVirtualization,
  virtualizationStateInitializer,
} from '../hooks/features/virtualization';
import {
  columnResizeStateInitializer,
  useGridColumnResize,
} from '../hooks/features/columnResize/useGridColumnResize';
import {
  rowSpanningStateInitializer,
  useGridRowSpanning,
} from '../hooks/features/rows/useGridRowSpanning';
import {
  listViewStateInitializer,
  useGridListView,
} from '../hooks/features/listView/useGridListView';
import { propsStateInitializer } from '../hooks/core/useGridProps';
import { useGridDataSource } from '../hooks/features/dataSource/useGridDataSource';

export const useDataGridComponent = (
  apiRef: RefObject<GridPrivateApiCommunity>,
  props: DataGridProcessedProps,
) => {
  useGridInitialization<GridPrivateApiCommunity>(apiRef, props);

  /**
   * Register all pre-processors called during state initialization here.
   */
  useGridRowSelectionPreProcessors(apiRef, props);
  useGridRowsPreProcessors(apiRef);

  /**
   * Register all state initializers here.
   */
  useGridInitializeState(propsStateInitializer, apiRef, props);
  useGridInitializeState(rowSelectionStateInitializer, apiRef, props);
  useGridInitializeState(columnsStateInitializer, apiRef, props);
  useGridInitializeState(rowsStateInitializer, apiRef, props);
  useGridInitializeState(paginationStateInitializer, apiRef, props);
  useGridInitializeState(editingStateInitializer, apiRef, props);
  useGridInitializeState(focusStateInitializer, apiRef, props);
  useGridInitializeState(sortingStateInitializer, apiRef, props);
  useGridInitializeState(preferencePanelStateInitializer, apiRef, props);
  useGridInitializeState(filterStateInitializer, apiRef, props);
  useGridInitializeState(rowSpanningStateInitializer, apiRef, props);
  useGridInitializeState(densityStateInitializer, apiRef, props);
  useGridInitializeState(columnResizeStateInitializer, apiRef, props);
  useGridInitializeState(columnMenuStateInitializer, apiRef, props);
  useGridInitializeState(columnGroupsStateInitializer, apiRef, props);
  useGridInitializeState(virtualizationStateInitializer, apiRef, props);
  useGridInitializeState(dimensionsStateInitializer, apiRef, props);
  useGridInitializeState(rowsMetaStateInitializer, apiRef, props);
  useGridInitializeState(listViewStateInitializer, apiRef, props);

  useGridVirtualizer(apiRef, props);
  useGridKeyboardNavigation(apiRef, props);
  useGridRowSelection(apiRef, props);
  useGridColumns(apiRef, props);
  useGridRows(apiRef, props);
  useGridRowSpanning(apiRef, props);
  useGridParamsApi(apiRef, props);
  useGridColumnSpanning(apiRef);
  useGridColumnGrouping(apiRef, props);
  useGridEditing(apiRef, props);
  useGridFocus(apiRef, props);
  useGridPreferencesPanel(apiRef, props);
  useGridFilter(apiRef, props);
  useGridSorting(apiRef, props);
  useGridDensity(apiRef, props);
  useGridColumnResize(apiRef, props);
  useGridPagination(apiRef, props);
  useGridRowsMeta(apiRef, props);
  useGridScroll(apiRef, props);
  useGridColumnMenu(apiRef);
  useGridCsvExport(apiRef, props);
  useGridPrintExport(apiRef, props);
  useGridClipboard(apiRef, props);
  useGridDimensions(apiRef, props);
  useGridEvents(apiRef, props);
  useGridStatePersistence(apiRef);
  useGridVirtualization(apiRef, props);
  useGridListView(apiRef, props);
  useGridDataSource(apiRef, props);

  // Should be the last thing to run, because all pre-processors should have been registered by now.
  React.useEffect(() => {
    apiRef.current.runAppliersForPendingProcessors();
  });
};
