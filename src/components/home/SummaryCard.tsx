// Card showing today's nicotine total, cost, and progress toward the limit.
import React from 'react';
import { Text, View } from 'react-native';

import { DISPLAY_CURRENCY } from '../../utils/currencyLabel';

interface Props {
  totalMg: number;
  totalCost: number;
  dailyLimitMg: number | null;
  limitProgress: number | null;
}

export const SummaryCard = ({
  totalMg,
  totalCost,
  dailyLimitMg,
  limitProgress,
}: Props) => {
  return (
    <View className="overflow-hidden rounded-3xl bg-primary/90 p-6 shadow-lg">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-sand">
          Keep within daily limit
        </Text>
        {dailyLimitMg ? (
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-sand">
              {dailyLimitMg} mg
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-6 items-center">
        <Text className="text-5xl font-bold text-sand">
          {totalMg.toFixed(1)} mg
        </Text>
        <Text className="mt-2 text-base text-sand/90">
          Today’s cost: {totalCost.toFixed(2)} {DISPLAY_CURRENCY}
        </Text>
        {dailyLimitMg ? (
          <Text className="text-sm text-sand/80">
            {limitProgress !== null
              ? `${Math.min(limitProgress, 100).toFixed(0)}% of limit`
              : 'Limit set'}
          </Text>
        ) : (
          <Text className="text-sm text-sand/80">No daily limit set</Text>
        )}
      </View>

      {dailyLimitMg ? (
        <View className="mt-6 h-3 w-full overflow-hidden rounded-full bg-sand/30">
          <View
            // Visual progress against the daily limit.
            className="h-full rounded-full bg-secondary"
            style={{ width: `${limitProgress ?? 0}%` }}
          />
        </View>
      ) : null}

      {dailyLimitMg !== null && totalMg > dailyLimitMg && (
        <Text className="mt-2 text-sm font-semibold text-red-100">
          Daily limit exceeded
        </Text>
      )}
    </View>
  );
};
