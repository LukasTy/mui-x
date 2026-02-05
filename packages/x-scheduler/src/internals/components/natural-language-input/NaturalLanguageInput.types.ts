import * as React from 'react';
import type { SchedulerEventId } from '@mui/x-scheduler-headless/models';

export interface NaturalLanguageInputProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onError'
> {
  /**
   * Placeholder text for the input field.
   * @default 'Describe your event...'
   */
  placeholder?: string;
  /**
   * Callback fired when an event is successfully created.
   */
  onEventCreated?: (eventId: SchedulerEventId) => void;
  /**
   * Callback fired when an error occurs during parsing or event creation.
   */
  onParseError?: (error: string) => void;
  /**
   * If `true`, the input will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the event will be automatically created after successful parsing.
   * If `false`, the parsed event data will be available but not automatically created.
   * @default true
   */
  autoCreateEvent?: boolean;
}
