// Compact SVG line chart plotting daily nicotine totals with optional labels for 7d range.
import React from 'react';
import { View, Text as RNText, useWindowDimensions } from 'react-native';
import { Svg, Path, Circle, Line, Text as SvgText } from 'react-native-svg';

import { DailyTotal, RangeOption } from '../../utils/stats';

interface Props {
  dailyTotals: DailyTotal[];
  range: RangeOption;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const StatsChart = ({ dailyTotals, range }: Props) => {
  const { width } = useWindowDimensions();
  // Layout values to keep the chart responsive and legible.
  const chartWidth = Math.max(width - 40, 220);
  const chartHeight = 200;
  const maxMg =
    dailyTotals.length > 0
      ? Math.max(...dailyTotals.map((d) => d.totalMg), 1)
      : 1;
  const paddingX = 36;
  const paddingY = 24;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const step = dailyTotals.length > 1 ? innerWidth / (dailyTotals.length - 1) : 0;
  const yTicks = 4;

  if (dailyTotals.length === 0) {
    return (
      <View className="mt-5 h-[240px] w-full items-center justify-center">
        <RNText className="text-sm text-night/70">
          No data in this range yet.
        </RNText>
      </View>
    );
  }

  return (
    <View className="mt-5 h-[240px] w-full items-center justify-center">
      <Svg width={chartWidth} height={chartHeight}>
        {/* Axes lines with dashed styling for readability. */}
        <Line
          x1={paddingX}
          y1={paddingY}
          x2={paddingX}
          y2={chartHeight - paddingY}
          stroke="#0f7a94"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <Line
          x1={paddingX}
          y1={chartHeight - paddingY}
          x2={chartWidth - paddingX}
          y2={chartHeight - paddingY}
          stroke="#0f7a94"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {/* Horizontal labels to show mg scale. */}
        {Array.from({ length: yTicks + 1 }).map((_, idx) => {
          const value = (maxMg / yTicks) * idx;
          const y =
            chartHeight -
            paddingY -
            (idx / yTicks) * innerHeight;
          return (
            <SvgText
              key={`y-label-${idx}`}
              x={paddingX - 6}
              y={y + 4}
              fontSize="10"
              fill="#1b3a4b"
              textAnchor="end"
            >
              {value.toFixed(0)}
            </SvgText>
          );
        })}
        {dailyTotals.length > 1 ? (
          (() => {
            // Build a polyline across all days with dots at each point.
            const points = dailyTotals.map((day, index) => {
              const value =
                maxMg === 0 ? 0 : (day.totalMg / maxMg) * innerHeight;
              const x = paddingX + index * step;
              const y = chartHeight - paddingY - value;
              return { x, y };
            });
            const pathD = points
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');
            return (
              <>
                <Path d={pathD} stroke="#1abc9c" strokeWidth={3} fill="none" />
                {points.map((p, idx) => (
                  <Circle
                    key={`${dailyTotals[idx].date}-point`}
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#1abc9c"
                  />
                ))}
              </>
            );
          })()
        ) : (
          (() => {
            // Special-case single point to keep the chart centered.
            const value =
              maxMg === 0
                ? 0
                : (dailyTotals[0].totalMg / maxMg) * innerHeight;
            const x = chartWidth / 2;
            const y = chartHeight - paddingY - value;
            return (
              <>
                <Path
                  d={`M ${x - 20} ${y} L ${x + 20} ${y}`}
                  stroke="#1abc9c"
                  strokeWidth={3}
                />
                <Circle cx={x} cy={y} r={5} fill="#1abc9c" />
              </>
            );
          })()
        )}

        {range === 7 &&
          /* Show x-axis labels only for the short 7-day range to avoid clutter. */
          dailyTotals.map((day, index) => {
            const x =
              dailyTotals.length > 1
                ? paddingX + index * step
                : chartWidth / 2;
            return (
              <SvgText
                key={`${day.date}-label`}
                x={x}
                y={chartHeight - paddingY + 14}
                fontSize="10"
                fill="#1b3a4b"
                textAnchor="middle"
              >
                {formatDate(day.date)}
              </SvgText>
            );
          })}
      </Svg>
    </View>
  );
};
