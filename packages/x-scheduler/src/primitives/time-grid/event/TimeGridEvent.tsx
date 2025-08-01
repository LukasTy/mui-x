'use client';
import * as React from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import { useButton } from '../../../base-ui-copy/utils/useButton';
import { useRenderElement } from '../../../base-ui-copy/utils/useRenderElement';
import { BaseUIComponentProps } from '../../../base-ui-copy/utils/types';
import { TimeGridEventCssVars } from './TimeGridEventCssVars';
import { useTimeGridColumnContext } from '../column/TimeGridColumnContext';
import { useEvent } from '../../utils/useEvent';
import { useEventPosition } from '../../utils/useEventPosition';
import { SchedulerValidDate } from '../../models';
import { getCursorPositionRelativeToElement } from '../../utils/drag-utils';
import { TimeGridEventContext } from './TimeGridEventContext';

export const TimeGridEvent = React.forwardRef(function TimeGridEvent(
  componentProps: TimeGridEvent.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    // Rendering props
    className,
    render,
    // Internal props
    start,
    end,
    eventId,
    isDraggable = false,
    // Props forwarded to the DOM element
    ...elementProps
  } = componentProps;

  // TODO: Expose a real `interactive` prop
  // to control whether the event should behave like a button
  const isInteractive = true;

  const ref = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const { getButtonProps, buttonRef } = useButton({ disabled: !isInteractive });

  const { start: columnStart, end: columnEnd } = useTimeGridColumnContext();

  const { position, duration } = useEventPosition({
    start,
    end,
    collectionStart: columnStart,
    collectionEnd: columnEnd,
  });

  const style = React.useMemo(
    () =>
      ({
        [TimeGridEventCssVars.yPosition]: `${position * 100}%`,
        [TimeGridEventCssVars.height]: `${duration * 100}%`,
      }) as React.CSSProperties,
    [position, duration],
  );

  const props = React.useMemo(() => ({ style }), [style]);

  const { state: eventState, props: eventProps } = useEvent({ start, end });

  const state: TimeGridEvent.State = React.useMemo(
    () => ({ ...eventState, dragging: isDragging, resizing: isResizing }),
    [eventState, isDragging, isResizing],
  );

  const contextValue: TimeGridEventContext = React.useMemo(
    () => ({
      eventId,
      start,
      end,
      setIsResizing,
    }),
    [eventId, start, end],
  );

  React.useEffect(() => {
    if (!isDraggable) {
      return;
    }

    // eslint-disable-next-line consistent-return
    return draggable({
      element: ref.current!,
      getInitialData: ({ input }) => ({
        type: 'event',
        source: 'TimeGridEvent',
        id: eventId,
        start,
        end,
        position: getCursorPositionRelativeToElement({ ref, input }),
      }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage });
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [isDraggable, start, end, eventId]);

  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, buttonRef, ref],
    props: [props, eventProps, elementProps, getButtonProps],
  });

  return (
    <TimeGridEventContext.Provider value={contextValue}>{element}</TimeGridEventContext.Provider>
  );
});

export namespace TimeGridEvent {
  export interface State extends useEvent.State {
    /**
     * Whether the event is being dragged.
     */
    dragging: boolean;
    /**
     * Whether the event is being resized.
     */
    resizing: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State>, useEvent.Parameters {
    /**
     * The unique identifier of the event.
     */
    eventId: string | number;
    /**
     * Whether the event can be dragged to change its start and end dates without changing the duration.
     * @default false
     */
    isDraggable?: boolean;
    /**
     * Whether the event start or end can be dragged to change its duration without changing this other date.
     */
    isResizable?: boolean;
  }

  export interface DragData {
    source: 'TimeGridEvent';
    id: string | number;
    start: SchedulerValidDate;
    end: SchedulerValidDate;
    position: { y: number };
  }
}
