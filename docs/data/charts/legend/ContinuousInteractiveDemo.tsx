import * as React from 'react';
import ChartsUsageDemo from 'docsx/src/modules/components/ChartsUsageDemo';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
import { LineChart } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { ContinuousColorLegend } from '@mui/x-charts/ChartsLegend';
import { dataset } from './tempAnomaly';

export default function ContinuousInteractiveDemo() {
  return (
    <ChartsUsageDemo
      componentName="Legend"
      data={
        {
          direction: {
            knob: 'select',
            defaultValue: 'horizontal',
            options: ['horizontal', 'vertical'],
          },
          labelPosition: {
            knob: 'select',
            defaultValue: 'end',
            options: ['start', 'end', 'extremes'],
          },
          length: {
            knob: 'number',
            defaultValue: 50,
            min: 10,
          },
          thickness: {
            knob: 'number',
            defaultValue: 12,
            min: 1,
            max: 20,
          },
          reverse: {
            knob: 'switch',
            defaultValue: false,
          },
        } as const
      }
      renderDemo={(props) => (
        <LineChart
          dataset={dataset}
          series={[
            {
              label: 'Global temperature anomaly relative to 1961-1990',
              dataKey: 'anomaly',
              showMark: false,
              valueFormatter: (value) => `${value?.toFixed(2)}°`,
            },
          ]}
          xAxis={[
            {
              scaleType: 'time',
              dataKey: 'year',
              disableLine: true,
              valueFormatter: (value) => value.getFullYear().toString(),
            },
          ]}
          yAxis={[
            {
              disableLine: true,
              disableTicks: true,
              valueFormatter: (value: number) => `${value}°`,
              colorMap: {
                type: 'continuous',
                min: -0.5,
                max: 1.5,
                color: (t) => interpolateRdYlBu(1 - t),
              },
            },
          ]}
          grid={{ horizontal: true }}
          height={300}
          slots={{ legend: ContinuousColorLegend }}
          slotProps={{
            legend: {
              axisDirection: 'y',
              direction: props.direction,
              thickness: props.thickness,
              labelPosition: props.labelPosition,
              reverse: props.reverse,
              sx: {
                [props.direction === 'horizontal' ? 'width' : 'height']:
                  `${props.length}${props.direction === 'horizontal' ? '%' : 'px'}`,
              },
            },
          }}
        >
          <ChartsReferenceLine y={0} />
        </LineChart>
      )}
      getCode={({ props }) => {
        return `import { ContinuousColorLegend } from '@mui/x-charts/ChartsLegend';

<LineChart
  {/** ... */}
  slots={{ legend: ContinuousColorLegend }}
  slotProps={{
    legend: {
      axisDirection: 'y',
      direction: '${props.direction}',
      thickness: ${props.thickness},
      labelPosition: '${props.labelPosition}',
      reverse: ${props.reverse},
      sx: { ${props.direction === 'horizontal' ? 'width' : 'height'}: '${props.length}${props.direction === 'horizontal' ? '%' : 'px'}' },
    },
  }}
/>
`;
      }}
    />
  );
}
