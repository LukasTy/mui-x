import { GridLocaleText } from '../models/api/gridLocaleTextApi';
import { getGridLocalization, Localization } from '../utils/getGridLocalization';

const plPLGrid: Partial<GridLocaleText> = {
  // Root
  noRowsLabel: 'Brak danych',
  noResultsOverlayLabel: 'Nie znaleziono wyników.',
  noColumnsOverlayLabel: 'Brak kolumn',
  noColumnsOverlayManageColumns: 'Zarządzaj kolumnami',
  // emptyPivotOverlayLabel: 'Add fields to rows, columns, and values to create a pivot table',

  // Density selector toolbar button text
  toolbarDensity: 'Wysokość rzędu',
  toolbarDensityLabel: 'Wysokość rzędu',
  toolbarDensityCompact: 'Kompakt',
  toolbarDensityStandard: 'Standard',
  toolbarDensityComfortable: 'Komfort',

  // Columns selector toolbar button text
  toolbarColumns: 'Kolumny',
  toolbarColumnsLabel: 'Zaznacz kolumny',

  // Filters toolbar button text
  toolbarFilters: 'Filtry',
  toolbarFiltersLabel: 'Pokaż filtry',
  toolbarFiltersTooltipHide: 'Ukryj filtry',
  toolbarFiltersTooltipShow: 'Pokaż filtry',
  toolbarFiltersTooltipActive: (count) => `Liczba aktywnych filtrów: ${count}`,

  // Quick filter toolbar field
  toolbarQuickFilterPlaceholder: 'Wyszukaj…',
  toolbarQuickFilterLabel: 'Szukaj',
  toolbarQuickFilterDeleteIconLabel: 'Wyczyść',

  // Export selector toolbar button text
  toolbarExport: 'Eksportuj',
  toolbarExportLabel: 'Eksportuj',
  toolbarExportCSV: 'Pobierz jako plik CSV',
  toolbarExportPrint: 'Drukuj',
  toolbarExportExcel: 'Pobierz jako plik Excel',

  // Toolbar pivot button
  // toolbarPivot: 'Pivot',

  // Toolbar AI Assistant button
  toolbarAssistant: 'Asystent AI',

  // Columns management text
  columnsManagementSearchTitle: 'Szukaj',
  columnsManagementNoColumns: 'Brak kolumn',
  columnsManagementShowHideAllText: 'Wyświetl/Ukryj wszystkie',
  columnsManagementReset: 'Resetuj',
  columnsManagementDeleteIconLabel: 'Wyczyść',

  // Filter panel text
  filterPanelAddFilter: 'Dodaj filtr',
  filterPanelRemoveAll: 'Usuń wszystkie',
  filterPanelDeleteIconLabel: 'Usuń',
  filterPanelLogicOperator: 'Operator logiczny',
  filterPanelOperator: 'Operator',
  filterPanelOperatorAnd: 'I',
  filterPanelOperatorOr: 'Lub',
  filterPanelColumns: 'Kolumny',
  filterPanelInputLabel: 'Wartość',
  filterPanelInputPlaceholder: 'Filtrowana wartość',

  // Filter operators text
  filterOperatorContains: 'zawiera',
  filterOperatorDoesNotContain: 'nie zawiera',
  filterOperatorEquals: 'równa się',
  filterOperatorDoesNotEqual: 'nie równa się',
  filterOperatorStartsWith: 'zaczyna się od',
  filterOperatorEndsWith: 'kończy się na',
  filterOperatorIs: 'równa się',
  filterOperatorNot: 'różne',
  filterOperatorAfter: 'większe niż',
  filterOperatorOnOrAfter: 'większe lub równe',
  filterOperatorBefore: 'mniejsze niż',
  filterOperatorOnOrBefore: 'mniejsze lub równe',
  filterOperatorIsEmpty: 'jest pusty',
  filterOperatorIsNotEmpty: 'nie jest pusty',
  filterOperatorIsAnyOf: 'jest jednym z',
  'filterOperator=': 'równa się',
  'filterOperator!=': 'nie równa się',
  'filterOperator>': 'większy niż',
  'filterOperator>=': 'większy lub równy',
  'filterOperator<': 'mniejszy niż',
  'filterOperator<=': 'mniejszy lub równy',

  // Header filter operators text
  headerFilterOperatorContains: 'Zawiera',
  headerFilterOperatorDoesNotContain: 'Nie zawiera',
  headerFilterOperatorEquals: 'Równa się',
  headerFilterOperatorDoesNotEqual: 'Nie równa się',
  headerFilterOperatorStartsWith: 'Zaczyna się od',
  headerFilterOperatorEndsWith: 'Kończy się na',
  headerFilterOperatorIs: 'Jest',
  headerFilterOperatorNot: 'Niepuste',
  headerFilterOperatorAfter: 'Jest po',
  headerFilterOperatorOnOrAfter: 'Jest w lub po',
  headerFilterOperatorBefore: 'Jest przed',
  headerFilterOperatorOnOrBefore: 'Jest w lub przed',
  headerFilterOperatorIsEmpty: 'Jest pusty',
  headerFilterOperatorIsNotEmpty: 'Nie jest pusty',
  headerFilterOperatorIsAnyOf: 'Jest jednym z',
  'headerFilterOperator=': 'Równa się',
  'headerFilterOperator!=': 'Nie równa się',
  'headerFilterOperator>': 'Większy niż',
  'headerFilterOperator>=': 'Większy lub równy',
  'headerFilterOperator<': 'Mniejszy niż',
  'headerFilterOperator<=': 'Mniejszy lub równy',
  headerFilterClear: 'Wyczyść',

  // Filter values text
  filterValueAny: 'dowolny',
  filterValueTrue: 'prawda',
  filterValueFalse: 'fałsz',

  // Column menu text
  columnMenuLabel: 'Menu',
  columnMenuAriaLabel: (columnName: string) => `Menu kolumny: ${columnName}`,
  columnMenuShowColumns: 'Pokaż wszystkie kolumny',
  columnMenuManageColumns: 'Zarządzaj kolumnami',
  columnMenuFilter: 'Filtr',
  columnMenuHideColumn: 'Ukryj',
  columnMenuUnsort: 'Anuluj sortowanie',
  columnMenuSortAsc: 'Sortuj rosnąco',
  columnMenuSortDesc: 'Sortuj malejąco',
  // columnMenuManagePivot: 'Manage pivot',

  // Column header text
  columnHeaderFiltersTooltipActive: (count) => `Liczba aktywnych filtrów: ${count}`,
  columnHeaderFiltersLabel: 'Pokaż filtry',
  columnHeaderSortIconLabel: 'Sortuj',

  // Rows selected footer text
  footerRowSelected: (count) => `Liczba wybranych wierszy: ${count.toLocaleString()}`,

  // Total row amount footer text
  footerTotalRows: 'Łączna liczba wierszy:',

  // Total visible row amount footer text
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString()} z ${totalCount.toLocaleString()}`,

  // Checkbox selection text
  checkboxSelectionHeaderName: 'Pole wyboru',
  checkboxSelectionSelectAllRows: 'Zaznacz wszystkie wiersze',
  checkboxSelectionUnselectAllRows: 'Odznacz wszystkie wiersze',
  checkboxSelectionSelectRow: 'Zaznacz wiersz',
  checkboxSelectionUnselectRow: 'Odznacz wiersz',

  // Boolean cell text
  booleanCellTrueLabel: 'tak',
  booleanCellFalseLabel: 'nie',

  // Actions cell more text
  actionsCellMore: 'więcej',

  // Column pinning text
  pinToLeft: 'Przypnij do lewej',
  pinToRight: 'Przypnij do prawej',
  unpin: 'Odepnij',

  // Tree Data
  treeDataGroupingHeaderName: 'Grupa',
  treeDataExpand: 'pokaż elementy potomne',
  treeDataCollapse: 'ukryj elementy potomne',

  // Grouping columns
  groupingColumnHeaderName: 'Grupa',
  groupColumn: (name) => `Grupuj według ${name}`,
  unGroupColumn: (name) => `Rozgrupuj ${name}`,

  // Master/detail
  detailPanelToggle: 'Szczegóły',
  expandDetailPanel: 'Rozwiń',
  collapseDetailPanel: 'Zwiń',

  // Pagination
  paginationRowsPerPage: 'Wierszy na stronę:',
  paginationDisplayedRows: ({ from, to, count, estimated }) => {
    if (!estimated) {
      return `${from}–${to} z ${count !== -1 ? count : `więcej niż ${to}`}`;
    }
    const estimatedLabel = estimated && estimated > to ? `około ${estimated}` : `więcej niż ${to}`;
    return `${from}–${to} z ${count !== -1 ? count : estimatedLabel}`;
  },
  paginationItemAriaLabel: (type) => {
    if (type === 'first') {
      return 'Przejdź do pierwszej strony';
    }
    if (type === 'last') {
      return 'Przejdź do ostatniej strony';
    }
    if (type === 'next') {
      return 'Przejdź do następnej strony';
    }
    // if (type === 'previous') {
    return 'Przejdź do poprzedniej strony';
  },

  // Row reordering text
  rowReorderingHeaderName: 'Porządkowanie wierszy',

  // Aggregation
  aggregationMenuItemHeader: 'Agregacja',
  aggregationFunctionLabelSum: 'suma',
  aggregationFunctionLabelAvg: 'średnia',
  aggregationFunctionLabelMin: 'minimum',
  aggregationFunctionLabelMax: 'maximum',
  aggregationFunctionLabelSize: 'rozmiar',

  // Pivot panel
  // pivotToggleLabel: 'Pivot',
  // pivotRows: 'Rows',
  // pivotColumns: 'Columns',
  // pivotValues: 'Values',
  // pivotCloseButton: 'Close pivot settings',
  // pivotSearchButton: 'Search fields',
  // pivotSearchControlPlaceholder: 'Search fields',
  // pivotSearchControlLabel: 'Search fields',
  // pivotSearchControlClear: 'Clear search',
  // pivotNoFields: 'No fields',
  // pivotMenuMoveUp: 'Move up',
  // pivotMenuMoveDown: 'Move down',
  // pivotMenuMoveToTop: 'Move to top',
  // pivotMenuMoveToBottom: 'Move to bottom',
  // pivotMenuRows: 'Rows',
  // pivotMenuColumns: 'Columns',
  // pivotMenuValues: 'Values',
  // pivotMenuOptions: 'Field options',
  // pivotMenuAddToRows: 'Add to Rows',
  // pivotMenuAddToColumns: 'Add to Columns',
  // pivotMenuAddToValues: 'Add to Values',
  // pivotMenuRemove: 'Remove',
  // pivotDragToRows: 'Drag here to create rows',
  // pivotDragToColumns: 'Drag here to create columns',
  // pivotDragToValues: 'Drag here to create values',
  // pivotYearColumnHeaderName: '(Year)',
  // pivotQuarterColumnHeaderName: '(Quarter)',

  // AI Assistant panel
  aiAssistantPanelTitle: 'Asystent AI',
  aiAssistantPanelClose: 'Zamknij asystenta AI',
  aiAssistantPanelNewConversation: 'Nowa konwersacja',
  aiAssistantPanelConversationHistory: 'Historia konwersacji',
  aiAssistantPanelEmptyConversation: 'Brak historii poleceń',
  aiAssistantSuggestions: 'Sugestie',

  // Prompt field
  promptFieldLabel: 'Wprowadź polecenie',
  promptFieldPlaceholder: 'Wpisz polecenie…',
  promptFieldPlaceholderWithRecording: 'Wpisz lub nagraj polecenie…',
  promptFieldPlaceholderListening: 'Nasłuchiwanie polecenia…',
  promptFieldSpeechRecognitionNotSupported:
    'Rozpoznawanie głosu nie jest obsługiwane przez Twoją przeglądarkę.',
  promptFieldSend: 'Wyślij',
  promptFieldRecord: 'Nagrywaj',
  promptFieldStopRecording: 'Zatrzymaj nagrywanie',

  // Prompt
  // promptRerun: 'Run again',
  // promptProcessing: 'Processing…',
  // promptAppliedChanges: 'Applied changes',

  // Prompt changes
  // promptChangeGroupDescription: (column: string) => `Group by ${column}`,
  // promptChangeAggregationLabel: (column: string, aggregation: string) => `${column} (${aggregation})`,
  // promptChangeAggregationDescription: (column: string, aggregation: string) => `Aggregate ${column} (${aggregation})`,
  // promptChangeFilterLabel: (column: string, operator: string, value: string) => {
  //   if (operator === 'is any of') {
  //     return `${column} is any of: ${value}`;
  //   }
  //   return `${column} ${operator} ${value}`;
  // },
  // promptChangeFilterDescription: (column: string, operator: string, value: string) => {
  //   if (operator === 'is any of') {
  //     return `Filter where ${column} is any of: ${value}`;
  //   }
  //   return `Filter where ${column} ${operator} ${value}`;
  // },
  // promptChangeSortDescription: (column: string, direction: string) => `Sort by ${column} (${direction})`,
  // promptChangePivotEnableLabel: 'Pivot',
  // promptChangePivotEnableDescription: 'Enable pivot',
  // promptChangePivotColumnsLabel: (count: number) => `Columns (${count})`,
  // promptChangePivotColumnsDescription: (column: string, direction: string) => `${column}${direction ? ` (${direction})` : ''}`,
  // promptChangePivotRowsLabel: (count: number) => `Rows (${count})`,
  // promptChangePivotValuesLabel: (count: number) => `Values (${count})`,
  // promptChangePivotValuesDescription: (column: string, aggregation: string) => `${column} (${aggregation})`,
};

export const plPL: Localization = getGridLocalization(plPLGrid);
