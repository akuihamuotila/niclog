import React from 'react';
import { FlatList, Text, View } from 'react-native';

import { NicotineEntry } from '../../types/nicotine';

interface Props {
  entries: NicotineEntry[];
  baseCurrency: string;
}

export const TodayEntries = ({ entries, baseCurrency }: Props) => {
  const renderEntry = ({ item }: { item: NicotineEntry }) => {
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <View className="mb-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm">
        <Text className="text-sm font-semibold text-primary">
          {time} • {item.productType.charAt(0).toUpperCase()}
          {item.productType.slice(1)}
        </Text>
        <Text className="mt-1 text-sm text-night">
          {item.amount} × {item.nicotinePerUnitMg} mg = {item.totalMg} mg
        </Text>
        <Text className="text-sm text-night">
          {item.amount} × {item.pricePerUnit} {baseCurrency} = {item.totalCost}{' '}
          {baseCurrency}
        </Text>
      </View>
    );
  };

  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-lg font-semibold text-night">Today’s entries</Text>
      {entries.length === 0 ? (
        <Text className="mt-2 text-sm text-night/70">
          No entries logged yet.
        </Text>
      ) : (
        <FlatList
          className="mt-3"
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};
