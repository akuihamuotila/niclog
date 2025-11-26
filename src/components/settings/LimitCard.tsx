import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export const LimitCard = ({ value, onChange }: Props) => {
  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-xl font-semibold text-night">Daily limit</Text>
      <Text className="mt-1 text-sm text-night/70">
        Set a daily nicotine cap to stay on track.
      </Text>
      <TextInput
        className="mt-4 rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
        placeholder="e.g. 30 (mg)"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};
