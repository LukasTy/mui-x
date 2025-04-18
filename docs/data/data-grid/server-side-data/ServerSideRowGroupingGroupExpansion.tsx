import * as React from 'react';
import {
  DataGridPremium,
  GridDataSource,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { useMockServer } from '@mui/x-data-grid-generator';
import Button from '@mui/material/Button';

export default function ServerSideRowGroupingGroupExpansion() {
  const apiRef = useGridApiRef();

  const { fetchRows, columns } = useMockServer({
    rowGrouping: true,
  });

  const dataSource: GridDataSource = React.useMemo(() => {
    return {
      getRows: async (params) => {
        const urlParams = new URLSearchParams({
          paginationModel: JSON.stringify(params.paginationModel),
          filterModel: JSON.stringify(params.filterModel),
          sortModel: JSON.stringify(params.sortModel),
          groupKeys: JSON.stringify(params.groupKeys),
          groupFields: JSON.stringify(params.groupFields),
        });
        const getRowsResponse = await fetchRows(
          `https://mui.com/x/api/data-grid?${urlParams.toString()}`,
        );
        return {
          rows: getRowsResponse.rows,
          rowCount: getRowsResponse.rowCount,
        };
      },
      getGroupKey: (row) => row.group,
      getChildrenCount: (row) => row.descendantCount,
    };
  }, [fetchRows]);

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: {
        model: ['company'],
      },
    },
  });

  return (
    <div style={{ width: '100%' }}>
      <Button
        onClick={() => {
          apiRef.current?.dataSource.cache.clear();
        }}
      >
        Clear cache
      </Button>

      <div style={{ height: 400, position: 'relative' }}>
        <DataGridPremium
          columns={columns}
          dataSource={dataSource}
          apiRef={apiRef}
          initialState={initialState}
          defaultGroupingExpansionDepth={-1}
        />
      </div>
    </div>
  );
}
