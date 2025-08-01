import * as React from 'react';
import {
  DataGridPremium,
  GridColDef,
  GridRowModel,
  GridPivotModel,
  GridSidebarValue,
} from '@mui/x-data-grid-premium';

const rows: GridRowModel[] = [
  { id: 1, product: 'Apples', region: 'North', quarter: 'Q1', sales: 1000 },
  { id: 2, product: 'Apples', region: 'South', quarter: 'Q1', sales: 1200 },
  { id: 3, product: 'Oranges', region: 'North', quarter: 'Q1', sales: 800 },
  { id: 4, product: 'Oranges', region: 'South', quarter: 'Q1', sales: 900 },
  { id: 5, product: 'Apples', region: 'North', quarter: 'Q2', sales: 1100 },
  { id: 6, product: 'Apples', region: 'South', quarter: 'Q2', sales: 1300 },
  { id: 7, product: 'Oranges', region: 'North', quarter: 'Q2', sales: 850 },
  { id: 8, product: 'Oranges', region: 'South', quarter: 'Q2', sales: 950 },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const columns: GridColDef[] = [
  { field: 'product', headerName: 'Product' },
  { field: 'region', headerName: 'Region' },
  { field: 'quarter', headerName: 'Quarter' },
  {
    field: 'sales',
    headerName: 'Sales',
    type: 'number',
    valueFormatter: (value) => {
      if (!value) {
        return '';
      }
      return currencyFormatter.format(value);
    },
  },
];

export default function GridPivotingControlled() {
  // Pivot model state
  const [pivotModel, setPivotModel] = React.useState<GridPivotModel>({
    rows: [{ field: 'product' }],
    columns: [{ field: 'region' }, { field: 'quarter', sort: 'asc' }],
    values: [{ field: 'sales', aggFunc: 'sum' }],
  });

  // Pivot mode toggle state
  const [pivotModeEnabled, setPivotModeEnabled] = React.useState(true);

  return (
    <div style={{ height: 560, width: '100%' }}>
      <DataGridPremium
        rows={rows}
        columns={columns}
        pivotModel={pivotModel}
        onPivotModelChange={setPivotModel}
        pivotActive={pivotModeEnabled}
        onPivotActiveChange={setPivotModeEnabled}
        columnGroupHeaderHeight={36}
        showToolbar
        initialState={{
          sidebar: {
            open: true,
            value: GridSidebarValue.Pivot,
          },
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: false,
          },
        }}
      />
    </div>
  );
}
