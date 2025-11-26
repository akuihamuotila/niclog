import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  currencies: string[];
  selected: string;
  onSelect: (currency: string) => void;
}

export const CurrencyCard = ({ currencies, selected, onSelect }: Props) => {
  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-xl font-semibold text-night">Currency</Text>
      <Text className="mt-1 text-sm text-night/70">
        Choose your base currency for costs.
      </Text>
      <View className="mt-4 flex-row flex-wrap gap-2">
        {currencies.map((currency) => {
          const isSelected = currency === selected;
          return (
            <TouchableOpacity
              key={currency}
              className={`rounded-full px-4 py-2 ${
                isSelected ? 'bg-secondary' : 'bg-sand'
              }`}
              onPress={() => onSelect(currency)}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-sand' : 'text-night'
                }`}
              >
                {currency}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
