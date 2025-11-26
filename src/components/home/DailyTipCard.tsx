// Daily tip card showing a single quote fetched from a public API.
import React from 'react';
import { Text, View } from 'react-native';

import { Quote } from '../../services/quoteService';

interface Props {
  quote: Quote | null;
}

export const DailyTipCard = ({ quote }: Props) => {
  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-sm font-semibold uppercase text-primary">Daily tip</Text>
      <Text className="mt-2 text-base text-night">“{quote?.content}”</Text>
      <Text className="mt-1 text-xs text-night/70">— {quote?.author}</Text>
    </View>
  );
};
