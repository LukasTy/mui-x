import { BarLabelClassKey } from '../BarChart';
import { BarElementClassKey } from '../BarChart/BarElement';
import { ChartsAxisClassKey } from '../ChartsAxis';
import { ChartsAxisHighlightClassKey } from '../ChartsAxisHighlight';
import { ChartsGridClassKey } from '../ChartsGrid';
import { ChartsLegendClassKey } from '../ChartsLegend';
import { ChartsTooltipClassKey } from '../ChartsTooltip';
import { AreaElementClassKey, LineElementClassKey, MarkElementClassKey } from '../LineChart';

// prettier-ignore
export interface PickersComponentNameToClassKey {
  MuiChartsAxis: ChartsAxisClassKey;
  MuiChartsAxisHighlight: ChartsAxisHighlightClassKey;
  MuiChartsGrid: ChartsGridClassKey;
  MuiChartsLegend: ChartsLegendClassKey;
  MuiChartsTooltip: ChartsTooltipClassKey;

  // BarChart components
  MuiBarElement: BarElementClassKey;
  MuiBarLabel: BarLabelClassKey;

  // LineChart components
  
  MuiAreaElement: AreaElementClassKey;
  MuiLineElement: LineElementClassKey;
  MuiMarkElement: MarkElementClassKey;
  // ScatterChart components
  
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends PickersComponentNameToClassKey {}
}

// disable automatic export
export {};
