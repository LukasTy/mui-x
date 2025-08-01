'use client';
import * as React from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useRenderElement } from '../../../base-ui-copy/utils/useRenderElement';
import { BaseUIComponentProps } from '../../../base-ui-copy/utils/types';
import { TimeGridColumnContext } from './TimeGridColumnContext';
import { TimeGridColumnPlaceholderContext } from './TimeGridColumnPlaceholderContext';
import { useAdapter } from '../../utils/adapter/useAdapter';
import { SchedulerValidDate } from '../../models';
import { mergeDateAndTime } from '../../utils/date-utils';
import { useTimeGridRootContext } from '../root/TimeGridRootContext';
import type { TimeGridRoot } from '../root';
import {
  createDateFromPositionInCollection,
  EVENT_DRAG_PRECISION_MINUTE,
  getCursorPositionRelativeToElement,
  isDraggingTimeGridEvent,
  isDraggingTimeGridEventResizeHandler,
} from '../../utils/drag-utils';

export const TimeGridColumn = React.forwardRef(function TimeGridColumn(
  componentProps: TimeGridColumn.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const adapter = useAdapter();

  const {
    // Rendering props
    className,
    render,
    // Internal props
    value,
    startTime,
    endTime,
    // Props forwarded to the DOM element
    ...elementProps
  } = componentProps;

  const ref = React.useRef<HTMLDivElement>(null);
  const { onEventChange, setPlaceholder, placeholder } = useTimeGridRootContext();

  const columnStart = React.useMemo(
    () =>
      startTime == null ? adapter.startOfDay(value) : mergeDateAndTime(adapter, value, startTime),
    [adapter, value, startTime],
  );

  const columnEnd = React.useMemo(
    () => (endTime == null ? adapter.endOfDay(value) : mergeDateAndTime(adapter, value, endTime)),
    [adapter, value, endTime],
  );

  const columnPlaceholder = React.useMemo(() => {
    if (placeholder == null) {
      return null;
    }

    if (
      adapter.isBefore(placeholder.start, columnStart) ||
      adapter.isAfter(placeholder.end, columnEnd)
    ) {
      return null;
    }

    return placeholder;
  }, [adapter, columnStart, columnEnd, placeholder]);

  const contextValue: TimeGridColumnContext = React.useMemo(
    () => ({
      start: columnStart,
      end: columnEnd,
    }),
    [columnStart, columnEnd],
  );

  const placeholderContextValue: TimeGridColumnPlaceholderContext = React.useMemo(
    () => ({
      placeholder: columnPlaceholder,
    }),
    [columnPlaceholder],
  );

  const props = React.useMemo(() => ({ role: 'gridcell' }), []);

  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, ref],
    props: [props, elementProps],
  });

  React.useEffect(() => {
    const domElement = ref.current;
    if (!domElement) {
      return () => {};
    }

    function getEventDropData({
      data,
      input,
    }: {
      data: Record<string, unknown>;
      input: { clientY: number };
    }): TimeGridRoot.EventData | undefined {
      const position = getCursorPositionRelativeToElement({ ref, input });

      // Move event
      if (isDraggingTimeGridEvent(data)) {
        const cursorPositionPx = position.y - data.position.y;

        // TODO: Avoid JS Date conversion
        const eventDuration =
          (adapter.toJsDate(data.end).getTime() - adapter.toJsDate(data.start).getTime()) /
          (60 * 1000);

        const newStartDate = createDateFromPositionInCollection({
          adapter,
          collectionStart: columnStart,
          collectionEnd: columnEnd,
          position: cursorPositionPx / domElement!.offsetHeight,
        });

        const newEndDate = adapter.addMinutes(newStartDate, eventDuration);

        return { start: newStartDate, end: newEndDate, id: data.id };
      }

      // Resize event
      if (isDraggingTimeGridEventResizeHandler(data)) {
        const cursorPositionPx = position.y - data.position.y;
        const cursorDate = createDateFromPositionInCollection({
          adapter,
          collectionStart: columnStart,
          collectionEnd: columnEnd,
          position: cursorPositionPx / domElement!.offsetHeight,
        });

        if (data.side === 'start') {
          const maxStartDate = adapter.addMinutes(data.end, -EVENT_DRAG_PRECISION_MINUTE);

          // Ensure the new start date is not after or too close to the end date.
          const newStartDate = adapter.isBefore(cursorDate, maxStartDate)
            ? cursorDate
            : maxStartDate;

          return {
            start: newStartDate,
            end: data.end,
            id: data.id,
          };
        }

        const minEndDate = adapter.addMinutes(data.start, EVENT_DRAG_PRECISION_MINUTE);

        // Ensure the new end date is not before or too close to the start date.
        const newEndDate = adapter.isAfter(cursorDate, minEndDate) ? cursorDate : minEndDate;

        return {
          start: data.start,
          end: newEndDate,
          id: data.id,
        };
      }

      return undefined;
    }

    return dropTargetForElements({
      element: domElement,
      canDrop: (arg) =>
        isDraggingTimeGridEvent(arg.source.data) ||
        isDraggingTimeGridEventResizeHandler(arg.source.data),
      onDrag: ({ source: { data }, location }) => {
        const newPlaceholder = getEventDropData({
          data,
          input: location.current.input,
        });

        if (newPlaceholder) {
          setPlaceholder(newPlaceholder);
        }
      },
      onDragStart: ({ source: { data } }) => {
        if (isDraggingTimeGridEvent(data) || isDraggingTimeGridEventResizeHandler(data)) {
          setPlaceholder({ id: data.id, start: data.start, end: data.end });
        }
      },
      onDrop: ({ source: { data }, location }) => {
        const newEvent = getEventDropData({
          data,
          input: location.current.input,
        });

        if (newEvent) {
          onEventChange(newEvent);
          setPlaceholder(null);
        }
      },
    });
  }, [adapter, onEventChange, setPlaceholder, columnStart, columnEnd]);

  return (
    <TimeGridColumnContext.Provider value={contextValue}>
      <TimeGridColumnPlaceholderContext.Provider value={placeholderContextValue}>
        {element}
      </TimeGridColumnPlaceholderContext.Provider>
    </TimeGridColumnContext.Provider>
  );
});

export namespace TimeGridColumn {
  export interface State {}

  export interface Props extends BaseUIComponentProps<'div', State> {
    /**
     * The value of the column.
     */
    value: SchedulerValidDate;
    /**
     * The start time of the column.
     * The date part is ignored, only the time part is used.
     * @defaultValue 00:00:00
     */
    startTime?: SchedulerValidDate;
    /**
     * The end time of the column.
     * The date part is ignored, only the time part is used.
     * @defaultValue 23:59:59
     */
    endTime?: SchedulerValidDate;
  }
}
