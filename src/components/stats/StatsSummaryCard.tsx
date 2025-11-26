import React from 'react';
import { Text, View } from 'react-native';

import { RangeOption, RangeSummary } from '../../utils/stats';

interface Props {
  summary: RangeSummary;
  range: RangeOption;
  currency: string;
}

export const StatsSummaryCard = ({ summary, range, currency }: Props) => {
  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-xl font-semibold text-night">Stats</Text>
      <Text className="mt-1 text-sm text-night/70">
        Last {range === 'all' ? 'all time' : `${range} days`}:{' '}
        {summary.totalMg.toFixed(1)} mg total ({summary.avgMg.toFixed(1)} mg/day),{' '}
        {summary.totalCost.toFixed(2)} {currency} total (
        {summary.avgCost.toFixed(2)} {currency}/day)
      </Text>
    </View>
  );
};
