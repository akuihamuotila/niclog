import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const SettingsScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-sand px-6">
      <View className="w-full items-center px-4">
        <Text className="mb-2 text-3xl font-semibold text-secondary">
          Settings
        </Text>
        <Text className="text-center text-base text-night">
          Customize NicLog preferences here later straight from this screen.
        </Text>
        <Text className="mt-4 text-center text-sm text-primary">
          Notifications, goals, and currency options, sounds, haptics will live here.
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
