import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { createRenderer, act, waitFor } from '@mui/internal-test-utils';
import {
  DataGridPremium as DataGrid,
  DataGridPremiumProps as DataGridProps,
  GridApi,
  useGridApiRef,
} from '@mui/x-data-grid-premium';
import { getColumnValues } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGridPremium />', () => {
  const { render } = createRenderer();

  const baselineProps = {
    autoHeight: isJSDOM,
    disableVirtualization: true,
    rows: [
      {
        id: 0,
        brand: 'Nike',
      },
      {
        id: 1,
        brand: 'Adidas',
      },
      {
        id: 2,
        brand: 'Puma',
      },
    ],
    columns: [{ field: 'brand' }],
  };

  let apiRef: RefObject<GridApi | null>;

  function TestCase(props: Partial<DataGridProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGrid
          {...baselineProps}
          apiRef={apiRef}
          showToolbar
          disableColumnSelector
          disableDensitySelector
          disableColumnFilter
          {...props}
          slotProps={{
            ...props?.slotProps,
            toolbar: {
              showQuickFilter: true,
              ...props?.slotProps?.toolbar,
            },
          }}
        />
      </div>
    );
  }

  // https://github.com/mui/mui-x/issues/9677
  it('should not fail when adding a grouping criterion', async () => {
    const { setProps } = render(
      <TestCase
        rows={[
          {
            id: 1,
            company: '20th Century Fox',
            director: 'James Cameron',
            year: 1999,
            title: 'Titanic',
          },
        ]}
        columns={[
          { field: 'company' },
          { field: 'director' },
          { field: 'year' },
          { field: 'title' },
        ]}
        initialState={{
          rowGrouping: {
            model: ['company'],
          },
          aggregation: {
            model: {
              director: 'size',
            },
          },
        }}
      />,
    );

    await act(async () => apiRef.current?.addRowGroupingCriteria('year'));

    setProps({
      filterModel: {
        items: [],
        quickFilterValues: ['Cameron'],
      },
    });

    await waitFor(() => {
      expect(getColumnValues(0)).to.deep.equal(['20th Century Fox (1)', '']);
    });
  });
});
