import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMockServer } from '@mui/x-data-grid-generator';

function ServerSideLazyLoadingInfinite() {
  const { fetchRows, editRow, ...props } = useMockServer(
    { rowLength: 100, editable: true },
    { useCursorPagination: false, minDelay: 200, maxDelay: 500 },
  );

  const dataSource = React.useMemo(
    () => ({
      getRows: async (params) => {
        const urlParams = new URLSearchParams({
          filterModel: JSON.stringify(params.filterModel),
          sortModel: JSON.stringify(params.sortModel),
          start: `${params.start}`,
          end: `${params.end}`,
        });
        const getRowsResponse = await fetchRows(
          `https://mui.com/x/api/data-grid?${urlParams.toString()}`,
        );

        return {
          rows: getRowsResponse.rows,
        };
      },
      updateRow: async (params) => {
        const syncedRow = await editRow(params.rowId, params.updatedRow);
        return syncedRow;
      },
    }),
    [fetchRows, editRow],
  );

  return (
    <div style={{ width: '100%', height: 400 }}>
      <DataGridPro
        {...props}
        dataSource={dataSource}
        lazyLoading
        paginationModel={{ page: 0, pageSize: 15 }}
      />
    </div>
  );
}

export default ServerSideLazyLoadingInfinite;
