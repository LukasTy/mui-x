import * as React from 'react';
import { spy } from 'sinon';
import { createRenderer, fireEvent, screen, createEvent } from '@mui/internal-test-utils';
import { getCell, getColumnValues, getRowsFieldContent } from 'test/utils/helperFn';
import { DataGridPro, gridClasses } from '@mui/x-data-grid-pro';
import { isJSDOM } from 'test/utils/skipIf';
import { useBasicDemoData } from '@mui/x-data-grid-generator';

function createDragOverEvent(target: ChildNode) {
  const dragOverEvent = createEvent.dragOver(target);
  // Safari 13 doesn't have DragEvent.
  // RTL fallbacks to Event which doesn't allow to set these fields during initialization.
  Object.defineProperty(dragOverEvent, 'clientX', { value: 1 });
  Object.defineProperty(dragOverEvent, 'clientY', { value: 1 });

  return dragOverEvent;
}

function createDragEndEvent(target: ChildNode, isOutsideTheGrid: boolean = false) {
  const dragEndEvent = createEvent.dragEnd(target);
  Object.defineProperty(dragEndEvent, 'dataTransfer', {
    value: { dropEffect: isOutsideTheGrid ? 'none' : 'copy' },
  });

  return dragEndEvent;
}

describe.skipIf(isJSDOM)('<DataGridPro /> - Row reorder', () => {
  const { render } = createRenderer();

  it('should cancel the reordering when dropping the row outside the grid', () => {
    const rows = [
      { id: 0, brand: 'Nike' },
      { id: 1, brand: 'Adidas' },
      { id: 2, brand: 'Puma' },
    ];
    const columns = [{ field: 'brand' }];

    function Test() {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPro rows={rows} columns={columns} rowReordering />
        </div>
      );
    }

    render(<Test />);

    expect(getRowsFieldContent('brand')).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    const rowReorderCell = getCell(0, 0).firstChild! as Element;
    const targetCell = getCell(2, 0);

    // Start the drag
    fireEvent.dragStart(rowReorderCell);
    fireEvent.dragEnter(targetCell);

    // Hover over the target row to render a drop indicator
    const dragOverEvent = createDragOverEvent(targetCell);
    fireEvent(targetCell, dragOverEvent);
    const targetRow = targetCell.closest('[data-id]');
    expect(targetRow).to.have.class(gridClasses['row--dropAbove']);

    // End the drag to update the row order
    const dragEndEvent = createDragEndEvent(rowReorderCell, true);
    fireEvent(rowReorderCell, dragEndEvent);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Nike', 'Adidas', 'Puma']);
  });

  it('should keep the order of the rows when dragStart is fired and rowReordering=false', () => {
    const rows = [
      { id: 0, brand: 'Nike' },
      { id: 1, brand: 'Adidas' },
      { id: 2, brand: 'Puma' },
    ];
    const columns = [{ field: 'brand' }];

    function Test() {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPro rows={rows} columns={columns} />
        </div>
      );
    }

    render(<Test />);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    const rowReorderCell = getCell(0, 0)!;
    fireEvent.dragStart(rowReorderCell);
    expect(rowReorderCell).not.to.have.class(gridClasses['row--dragging']);
  });

  it('should keep the order of the rows when dragEnd is fired and rowReordering=false', () => {
    const rows = [
      { id: 0, brand: 'Nike' },
      { id: 1, brand: 'Adidas' },
      { id: 2, brand: 'Puma' },
    ];
    const columns = [{ field: 'brand' }];

    function Test() {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPro rows={rows} columns={columns} />
        </div>
      );
    }

    render(<Test />);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    const rowReorderCell = getCell(0, 0).firstChild!;
    const dragEndEvent = createDragEndEvent(rowReorderCell, true);
    fireEvent(rowReorderCell, dragEndEvent);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Nike', 'Adidas', 'Puma']);
  });

  it('should call onRowOrderChange after the row stops being dragged', () => {
    const handleOnRowOrderChange = spy();
    function Test() {
      const rows = [
        { id: 0, brand: 'Nike' },
        { id: 1, brand: 'Adidas' },
        { id: 2, brand: 'Puma' },
      ];
      const columns = [{ field: 'brand' }];

      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPro
            rows={rows}
            columns={columns}
            onRowOrderChange={handleOnRowOrderChange}
            rowReordering
          />
        </div>
      );
    }

    render(<Test />);

    expect(getRowsFieldContent('brand')).to.deep.equal(['Nike', 'Adidas', 'Puma']);

    const rowReorderCell = getCell(0, 0).firstChild!;
    const targetCell = getCell(2, 0)!;
    fireEvent.dragStart(rowReorderCell);
    fireEvent.dragEnter(targetCell);
    const dragOverEvent = createDragOverEvent(targetCell);
    fireEvent(targetCell, dragOverEvent);
    expect(handleOnRowOrderChange.callCount).to.equal(0);
    const dragEndEvent = createDragEndEvent(rowReorderCell);
    fireEvent(rowReorderCell, dragEndEvent);

    expect(handleOnRowOrderChange.callCount).to.equal(1);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Adidas', 'Nike', 'Puma']);
  });

  it('should prevent drag events propagation', () => {
    const handleDragStart = spy();
    const handleDragEnter = spy();
    const handleDragOver = spy();
    const handleDragEnd = spy();
    function Test() {
      const data = useBasicDemoData(3, 3);

      return (
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          style={{ width: 300, height: 300 }}
        >
          <DataGridPro {...data} rowReordering />
        </div>
      );
    }

    render(<Test />);

    const rowReorderCell = getCell(0, 0).firstChild!;
    const targetrowReorderCell = getCell(1, 0)!;

    fireEvent.dragStart(rowReorderCell);
    fireEvent.dragEnter(targetrowReorderCell);
    const dragOverRowEvent = createDragOverEvent(targetrowReorderCell);
    fireEvent(targetrowReorderCell, dragOverRowEvent);
    const dragEndRowEvent = createDragEndEvent(rowReorderCell);
    fireEvent(rowReorderCell, dragEndRowEvent);

    expect(handleDragStart.callCount).to.equal(0);
    expect(handleDragOver.callCount).to.equal(0);
    expect(handleDragEnd.callCount).to.equal(0);
  });

  it('should reorder rows correctly on any page when pagination is enabled', () => {
    const rows = [
      { id: 0, brand: 'Nike' },
      { id: 1, brand: 'Adidas' },
      { id: 2, brand: 'Puma' },
      { id: 3, brand: 'Skechers' },
      { id: 4, brand: 'Vans' },
      { id: 5, brand: 'Converse' },
    ];
    const columns = [{ field: 'brand' }];

    function Test() {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGridPro
            rows={rows}
            columns={columns}
            rowReordering
            pagination
            initialState={{
              pagination: {
                paginationModel: { pageSize: 3 },
              },
            }}
            pageSizeOptions={[3]}
          />
        </div>
      );
    }

    render(<Test />);
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(getColumnValues(0)).to.deep.equal(['3', '4', '5']);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Skechers', 'Vans', 'Converse']);
    const rowReorderCell = getCell(3, 0).firstChild! as Element;
    const targetCell = getCell(5, 0);

    // Start the drag
    fireEvent.dragStart(rowReorderCell);
    fireEvent.dragEnter(targetCell);
    const sourceRow = rowReorderCell.closest('[data-id]');
    expect(sourceRow).to.have.class(gridClasses['row--beingDragged']);

    // Hover over the target row to render a drop indicator
    const dragOverEvent = createDragOverEvent(targetCell);
    fireEvent(targetCell, dragOverEvent);
    const targetRow = targetCell.closest('[data-id]');
    expect(targetRow).to.have.class(gridClasses['row--dropAbove']);

    // End the drag to update the row order
    const dragEndEvent = createDragEndEvent(rowReorderCell);
    fireEvent(rowReorderCell, dragEndEvent);
    expect(getRowsFieldContent('brand')).to.deep.equal(['Vans', 'Skechers', 'Converse']);
  });

  it('should render vertical scroll areas when row reordering is active', () => {
    // Create more rows to ensure scrolling is needed
    const rows = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      brand: `Brand ${i}`,
    }));
    const columns = [{ field: 'brand' }];

    function Test() {
      return (
        <div style={{ width: 300, height: 200 }}>
          {/* Smaller height to force scrolling */}
          <DataGridPro rows={rows} columns={columns} rowReordering />
        </div>
      );
    }

    const { container } = render(<Test />);

    // Initially, no scroll areas should be visible
    expect(container.querySelectorAll(`.${gridClasses.scrollArea}`)).to.have.length(0);

    // Start dragging a row at the top (scroll = 0)
    const rowReorderCell = getCell(0, 0).firstChild!;
    fireEvent.dragStart(rowReorderCell);

    // Check what scroll areas are rendered when at the top
    let allScrollAreas = container.querySelectorAll(`.${gridClasses.scrollArea}`);
    let upScrollAreas = container.querySelectorAll(`.${gridClasses['scrollArea--up']}`);
    let downScrollAreas = container.querySelectorAll(`.${gridClasses['scrollArea--down']}`);

    // At the top: only down scroll area should be rendered (up should NOT exist)
    expect(allScrollAreas.length).to.equal(1);
    expect(upScrollAreas).to.have.length(0); // No up scroll area when at top
    expect(downScrollAreas).to.have.length(1); // Down scroll area available

    // End dragging to reset state
    let dragEndEvent = createDragEndEvent(rowReorderCell);
    fireEvent(rowReorderCell, dragEndEvent);

    // Scroll areas should be hidden again
    expect(container.querySelectorAll(`.${gridClasses.scrollArea}`)).to.have.length(0);

    // Now scroll down to enable both up and down scrolling
    const virtualScroller = container.querySelector('.MuiDataGrid-virtualScroller')!;
    fireEvent.scroll(virtualScroller, { target: { scrollTop: 100 } });

    // Start dragging again after scrolling down
    fireEvent.dragStart(rowReorderCell);

    // Check scroll areas after scrolling down
    allScrollAreas = container.querySelectorAll(`.${gridClasses.scrollArea}`);
    upScrollAreas = container.querySelectorAll(`.${gridClasses['scrollArea--up']}`);
    downScrollAreas = container.querySelectorAll(`.${gridClasses['scrollArea--down']}`);

    // After scrolling down: both up and down scroll areas should be rendered
    expect(allScrollAreas.length).to.equal(2);
    expect(upScrollAreas).to.have.length(1); // Up scroll area now available
    expect(downScrollAreas).to.have.length(1); // Down scroll area still available

    // End dragging
    dragEndEvent = createDragEndEvent(rowReorderCell);
    fireEvent(rowReorderCell, dragEndEvent);

    // Scroll areas should be hidden again
    expect(container.querySelectorAll(`.${gridClasses.scrollArea}`)).to.have.length(0);
  });
});
