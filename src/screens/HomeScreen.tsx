import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const HomeScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-sand px-6">
      <View className="w-full items-center px-4">
        <Text className="mb-2 text-3xl font-semibold text-secondary">Home</Text>
        <Text className="text-center text-base text-night">
          NicLog home screen placeholder
        </Text>
        <Text className="mt-4 text-center text-sm text-primary">
          Start logging your usage and keep the streak going.
        </Text>
        <TouchableOpacity className="mt-8 w-full rounded-full bg-secondary px-6 py-4 shadow-md">
          <Text className="text-center text-lg font-semibold text-sand">
            **CLICKABLE** Log Nicotine Use **CLICKABLE**
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
