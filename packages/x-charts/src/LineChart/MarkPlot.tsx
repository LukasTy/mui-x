'use client';
import PropTypes from 'prop-types';
import * as React from 'react';
import { DEFAULT_X_AXIS_KEY } from '../constants';
import { useSkipAnimation } from '../hooks/useSkipAnimation';
import { useChartId } from '../hooks/useChartId';
import { getValueToPositionMapper } from '../hooks/useScale';
import { useLineSeriesContext } from '../hooks/useLineSeries';
import { cleanId } from '../internals/cleanId';
import { LineItemIdentifier } from '../models/seriesType/line';
import { CircleMarkElement } from './CircleMarkElement';
import getColor from './seriesConfig/getColor';
import { MarkElement, MarkElementProps } from './MarkElement';
import { useChartContext } from '../context/ChartProvider';
import { useItemHighlightedGetter, useXAxes, useYAxes } from '../hooks';
import { useInternalIsZoomInteracting } from '../internals/plugins/featurePlugins/useChartCartesianAxis/useInternalIsZoomInteracting';
import {
  selectorChartsHighlightXAxisIndex,
  UseChartCartesianAxisSignature,
} from '../internals/plugins/featurePlugins/useChartCartesianAxis';
import { useSelector } from '../internals/store/useSelector';
import { AxisId } from '../models/axis';

export interface MarkPlotSlots {
  mark?: React.JSXElementConstructor<MarkElementProps>;
}

export interface MarkPlotSlotProps {
  mark?: Partial<MarkElementProps>;
}

export interface MarkPlotProps
  extends React.SVGAttributes<SVGSVGElement>,
    Pick<MarkElementProps, 'skipAnimation'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: MarkPlotSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: MarkPlotSlotProps;
  /**
   * Callback fired when a line mark item is clicked.
   * @param {React.MouseEvent<SVGPathElement, MouseEvent>} event The event source of the callback.
   * @param {LineItemIdentifier} lineItemIdentifier The line mark item identifier.
   */
  onItemClick?: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    lineItemIdentifier: LineItemIdentifier,
  ) => void;
}

/**
 * Demos:
 *
 * - [Lines](https://mui.com/x/react-charts/lines/)
 * - [Line demonstration](https://mui.com/x/react-charts/line-demo/)
 *
 * API:
 *
 * - [MarkPlot API](https://mui.com/x/api/charts/mark-plot/)
 */
function MarkPlot(props: MarkPlotProps) {
  const { slots, slotProps, skipAnimation: inSkipAnimation, onItemClick, ...other } = props;
  const isZoomInteracting = useInternalIsZoomInteracting();
  const skipAnimation = useSkipAnimation(isZoomInteracting || inSkipAnimation);

  const seriesData = useLineSeriesContext();
  const { xAxis, xAxisIds } = useXAxes();
  const { yAxis, yAxisIds } = useYAxes();

  const chartId = useChartId();
  const { instance, store } = useChartContext<[UseChartCartesianAxisSignature]>();
  const { isFaded, isHighlighted } = useItemHighlightedGetter();
  const xAxisHighlightIndexes = useSelector(store, selectorChartsHighlightXAxisIndex);

  const highlightedItems = React.useMemo(() => {
    const rep: Record<AxisId, Set<number>> = {};

    for (const { dataIndex, axisId } of xAxisHighlightIndexes) {
      if (rep[axisId] === undefined) {
        rep[axisId] = new Set([dataIndex]);
      } else {
        rep[axisId].add(dataIndex);
      }
    }
    return rep;
  }, [xAxisHighlightIndexes]);

  if (seriesData === undefined) {
    return null;
  }
  const { series, stackingGroups } = seriesData;
  const defaultXAxisId = xAxisIds[0];
  const defaultYAxisId = yAxisIds[0];

  return (
    <g {...other}>
      {stackingGroups.flatMap(({ ids: groupIds }) => {
        return groupIds.map((seriesId) => {
          const {
            xAxisId = defaultXAxisId,
            yAxisId = defaultYAxisId,
            stackedData,
            data,
            showMark = true,
            shape = 'circle',
          } = series[seriesId];

          if (showMark === false) {
            return null;
          }

          const xScale = getValueToPositionMapper(xAxis[xAxisId].scale);
          const yScale = yAxis[yAxisId].scale;
          const xData = xAxis[xAxisId].data;

          if (xData === undefined) {
            throw new Error(
              `MUI X Charts: ${
                xAxisId === DEFAULT_X_AXIS_KEY
                  ? 'The first `xAxis`'
                  : `The x-axis with id "${xAxisId}"`
              } should have data property to be able to display a line plot.`,
            );
          }

          const clipId = cleanId(`${chartId}-${seriesId}-line-clip`); // We assume that if displaying line mark, the line will also be rendered

          const colorGetter = getColor(series[seriesId], xAxis[xAxisId], yAxis[yAxisId]);

          const Mark = slots?.mark ?? (shape === 'circle' ? CircleMarkElement : MarkElement);

          const isSeriesHighlighted = isHighlighted({ seriesId });
          const isSeriesFaded = !isSeriesHighlighted && isFaded({ seriesId });

          return (
            <g key={seriesId} clipPath={`url(#${clipId})`} data-series={seriesId}>
              {xData
                ?.map((x, index) => {
                  const value = data[index] == null ? null : stackedData[index][1];
                  return {
                    x: xScale(x),
                    y: value === null ? null : yScale(value)!,
                    position: x,
                    value,
                    index,
                  };
                })
                .filter(({ x, y, index, position, value }) => {
                  if (value === null || y === null) {
                    // Remove missing data point
                    return false;
                  }
                  if (!instance.isPointInside(x, y)) {
                    // Remove out of range
                    return false;
                  }
                  if (showMark === true) {
                    return true;
                  }
                  return showMark({
                    x,
                    y,
                    index,
                    position,
                    value,
                  });
                })
                .map(({ x, y, index }) => {
                  return (
                    <Mark
                      key={`${seriesId}-${index}`}
                      id={seriesId}
                      dataIndex={index}
                      shape={shape}
                      color={colorGetter(index)}
                      x={x}
                      y={y!} // Don't know why TS doesn't get from the filter that y can't be null
                      skipAnimation={skipAnimation}
                      onClick={
                        onItemClick &&
                        ((event) =>
                          onItemClick(event, { type: 'line', seriesId, dataIndex: index }))
                      }
                      isHighlighted={highlightedItems[xAxisId]?.has(index) || isSeriesHighlighted}
                      isFaded={isSeriesFaded}
                      {...slotProps?.mark}
                    />
                  );
                })}
            </g>
          );
        });
      })}
    </g>
  );
}

MarkPlot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Callback fired when a line mark item is clicked.
   * @param {React.MouseEvent<SVGPathElement, MouseEvent>} event The event source of the callback.
   * @param {LineItemIdentifier} lineItemIdentifier The line mark item identifier.
   */
  onItemClick: PropTypes.func,
  /**
   * If `true`, animations are skipped.
   */
  skipAnimation: PropTypes.bool,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
} as any;

export { MarkPlot };
