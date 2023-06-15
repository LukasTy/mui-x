import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_generateUtilityClasses as generateUtilityClasses,
} from '@mui/utils';

export interface DateRangeCalendarClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the container of a month. */
  monthContainer: string;
  /** Styles applied to the container of a month if `displayWeekNumber=false`. */
  monthContainerWithoutWeekNumber: string;
  /** Styles applied to the arrow switcher element. */
  arrowSwitcher: string;
  /** Styles applied to the day calendar container when dragging */
  dayDragging: string;
}

export type DateRangeCalendarClassKey = keyof DateRangeCalendarClasses;

export const getDateRangeCalendarUtilityClass = (slot: string) =>
  generateUtilityClass('MuiDateRangeCalendar', slot);

export const dateRangeCalendarClasses: DateRangeCalendarClasses = generateUtilityClasses(
  'MuiDateRangeCalendar',
  ['root', 'monthContainer', 'monthContainerWithoutWeekNumber', 'arrowSwitcher', 'dayDragging'],
);
