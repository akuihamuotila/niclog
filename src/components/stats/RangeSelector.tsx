// Button group for choosing the stats range (7d, 30d, etc.).
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { RangeOption } from '../../utils/stats';

export interface RangeOptionItem {
  label: string;
  value: RangeOption;
}

interface Props {
  options: RangeOptionItem[];
  selected: RangeOption;
  onSelect: (value: RangeOption) => void;
}

export const RangeSelector = ({ options, selected, onSelect }: Props) => {
  return (
    <View className="mt-4 flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <TouchableOpacity
            key={option.label}
            className={`rounded-full px-3 py-2 ${
              isSelected ? 'bg-secondary' : 'bg-sand'
            }`}
            onPress={() => onSelect(option.value)}
          >
            <Text
              className={`text-sm font-semibold ${
                isSelected ? 'text-sand' : 'text-night'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
