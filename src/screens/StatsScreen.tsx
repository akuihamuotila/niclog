import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const StatsScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-sand px-6">
      <View className="w-full items-center px-4">
        <Text className="mb-2 text-3xl font-semibold text-secondary">Stats</Text>
        <Text className="text-center text-base text-night">
          Visualize usage trends here soon
        </Text>
        <Text className="mt-4 text-center text-sm text-primary">
          Charts and insights will appear here once logging begins.
        </Text>
        <TouchableOpacity className="mt-8 w-full rounded-full bg-secondary px-6 py-4 shadow-md">
          <Text className="text-center text-lg font-semibold text-sand">
            **CLICKABLE**
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
