import * as React from 'react';
import { spy } from 'sinon';
import { createRenderer, fireEvent, waitFor } from '@mui/internal-test-utils';
import { DataGrid, GridValueFormatter } from '@mui/x-data-grid';
import { getCell } from 'test/utils/helperFn';
import { getBasicGridData } from '@mui/x-data-grid-generator';
import { isJSDOM } from 'test/utils/skipIf';

describe('<DataGrid /> - Cells', () => {
  const { render } = createRenderer();

  const baselineProps = {
    autoHeight: isJSDOM,
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
  };

  describe('cellClassName', () => {
    it('should append the CSS class defined in cellClassName', () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGrid {...baselineProps} columns={[{ field: 'brand', cellClassName: 'foobar' }]} />
        </div>,
      );
      expect(getCell(0, 0)).to.have.class('foobar');
    });

    it('should append the CSS class returned by cellClassName', () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGrid
            {...baselineProps}
            columns={[{ field: 'brand', cellClassName: () => 'foobar' }]}
          />
        </div>,
      );
      expect(getCell(0, 0)).to.have.class('foobar');
    });
  });

  // Doesn't work with mocked window.getComputedStyle
  describe.skipIf(isJSDOM)('prop: showCellVerticalBorder', () => {
    function expectRightBorder(element: HTMLElement) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.getPropertyValue('border-right-color');
      const width = computedStyle.getPropertyValue('border-right-width');

      expect(width).to.equal('1px');
      // should not be transparent
      expect(color).not.to.equal('rgba(0, 0, 0, 0)');
    }

    it('should add right border to cells', () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGrid
            {...baselineProps}
            columns={[{ field: 'id' }, { field: 'brand' }]}
            showCellVerticalBorder
          />
        </div>,
      );

      expectRightBorder(getCell(0, 0));
      expectRightBorder(getCell(1, 0));
      expectRightBorder(getCell(2, 0));
    });

    // See https://github.com/mui/mui-x/issues/4122
    it('should add right border to cells in the last row', () => {
      render(
        <div style={{ width: 300, height: 500 }}>
          <DataGrid
            {...baselineProps}
            autoHeight
            columns={[{ field: 'id' }, { field: 'brand' }]}
            showCellVerticalBorder
          />
        </div>,
      );
      expectRightBorder(getCell(2, 0));
    });
  });

  it('should append the CSS class returned by cellClassName', () => {
    render(
      <div style={{ width: 300, height: 500 }}>
        <DataGrid
          {...baselineProps}
          columns={[{ field: 'brand' }]}
          getCellClassName={() => 'foobar'}
        />
      </div>,
    );
    expect(getCell(0, 0)).to.have.class('foobar');
  });

  it('should allow renderCell to return a false-ish value', () => {
    render(
      <div style={{ width: 300, height: 500 }}>
        <DataGrid
          autoHeight={isJSDOM}
          columns={[{ field: 'brand', renderCell: () => 0 }]}
          rows={[{ id: 1, brand: 'Nike' }]}
        />
      </div>,
    );
    expect(getCell(0, 0)).to.have.text('0');
  });

  it('should render nothing in cell when renderCell returns a `null` value', () => {
    render(
      <div style={{ width: 300, height: 500 }}>
        <DataGrid
          autoHeight={isJSDOM}
          columns={[{ field: 'brand', renderCell: () => null }]}
          rows={[{ id: 1, brand: 'Nike' }]}
        />
      </div>,
    );
    expect(getCell(0, 0)).to.have.text('');
  });

  it('should call the valueFormatter with the correct params', () => {
    const valueFormatter = spy<GridValueFormatter<{ id: number; isActive: boolean }>>((value) =>
      value ? 'Yes' : 'No',
    );
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid
          columns={[
            {
              field: 'isActive',
              valueFormatter,
              width: 200,
            },
          ]}
          rows={[{ id: 0, isActive: true }]}
        />
      </div>,
    );
    expect(getCell(0, 0)).to.have.text('Yes');
    // expect(valueFormatter.lastCall.args[0]).to.have.keys('id', 'field', 'value', 'api');
    expect(valueFormatter.lastCall.args[0]).to.equal(true);
    expect(valueFormatter.lastCall.args[1]).to.deep.equal({ id: 0, isActive: true });
    expect(valueFormatter.lastCall.args[2].field).to.equal('isActive');
  });

  it('should throw when focusing cell without updating the state', async () => {
    render(
      <div style={{ width: 300, height: 500 }}>
        <DataGrid
          {...baselineProps}
          columns={[{ field: 'brand', cellClassName: 'foobar' }]}
          experimentalFeatures={{ warnIfFocusStateIsNotSynced: true }}
        />
      </div>,
    );

    expect(() => {
      getCell(1, 0).focus();
    }).toWarnDev(['MUI X: The cell with id=1 and field=brand received focus.']);
  });

  it.skipIf(isJSDOM)(
    'should keep the focused cell/row rendered in the DOM if it scrolls outside the viewport',
    async () => {
      const rowHeight = 50;
      const defaultData = getBasicGridData(20, 20);

      const { user } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid columns={defaultData.columns} rows={defaultData.rows} rowHeight={rowHeight} />
        </div>,
      );

      const virtualScroller = document.querySelector('.MuiDataGrid-virtualScroller')!;

      const cell = getCell(1, 3);
      await user.click(cell);

      const activeElementTextContent = document.activeElement?.textContent;
      const columnWidth = document.activeElement!.clientWidth;

      const tenRows = 10 * rowHeight;
      fireEvent.scroll(virtualScroller, { target: { scrollTop: tenRows } });
      expect(document.activeElement?.textContent).to.equal(activeElementTextContent);

      const tenColumns = 10 * columnWidth;
      fireEvent.scroll(virtualScroller, { target: { scrollLeft: tenColumns } });

      expect(document.activeElement?.textContent).to.equal(activeElementTextContent);
    },
  );

  // See https://github.com/mui/mui-x/issues/6378
  // Needs layout
  it.skipIf(isJSDOM)(
    'should not cause scroll jump when focused cell mounts in the render zone',
    async () => {
      const rowHeight = 50;
      const columns = [{ field: 'id' }];
      const rows = [];
      for (let i = 0; i < 20; i += 1) {
        rows.push({ id: i });
      }

      const { user } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid columns={columns} rows={rows} rowHeight={rowHeight} />
        </div>,
      );

      const virtualScroller = document.querySelector('.MuiDataGrid-virtualScroller')!;

      const thirdRowCell = getCell(2, 0);
      await user.click(thirdRowCell);

      const sixRows = 6 * rowHeight;
      fireEvent.scroll(virtualScroller, { target: { scrollTop: sixRows } });
      await waitFor(() => {
        expect(virtualScroller.scrollTop).to.equal(300);
      });

      const twoRows = 2 * rowHeight;
      fireEvent.scroll(virtualScroller, { target: { scrollTop: twoRows } });
      await waitFor(() => {
        expect(virtualScroller.scrollTop).to.equal(twoRows);
      });
    },
  );
});
