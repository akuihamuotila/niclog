import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ProductType } from '../../types/nicotine';

const PRODUCT_OPTIONS: { label: string; value: ProductType }[] = [
  { label: 'Snus', value: 'snus' },
  { label: 'Pouch', value: 'pouch' },
  { label: 'Vape', value: 'vape' },
  { label: 'Cigarette', value: 'cigarette' },
  { label: 'Other', value: 'other' },
];

interface Props {
  selected: ProductType | null;
  onSelect: (value: ProductType) => void;
}

export const ProductSelector = ({ selected, onSelect }: Props) => {
  return (
    <View className="mt-5 flex-row flex-wrap justify-center gap-3">
      {PRODUCT_OPTIONS.map((option) => {
        const isSelected = option.value === selected;
        return (
          <TouchableOpacity
            key={option.value}
            className={`w-[30%] min-w-[90px] items-center rounded-2xl px-3 py-3 ${
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
