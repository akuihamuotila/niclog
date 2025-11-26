// Form for adding a nicotine entry with product picker, numeric inputs, preview, and submit.
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ProductType } from '../../types/nicotine';
import { ProductSelector } from './ProductSelector';
import { DISPLAY_CURRENCY } from '../../utils/currencyLabel';

interface Props {
  selectedProduct: ProductType | null;
  nicotinePerUnit: string;
  amount: string;
  pricePerUnit: string;
  preview: { totalMg: number; totalCost: number } | null;
  error: string | null;
  onSelectProduct: (value: ProductType) => void;
  onChangeNicotine: (text: string) => void;
  onChangeAmount: (text: string) => void;
  onChangePrice: (text: string) => void;
  onSubmit: () => void;
}

export const EntryForm = ({
  selectedProduct,
  nicotinePerUnit,
  amount,
  pricePerUnit,
  preview,
  error,
  onSelectProduct,
  onChangeNicotine,
  onChangeAmount,
  onChangePrice,
  onSubmit,
}: Props) => {
  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-center text-xl font-semibold text-night">
        Log new entry
      </Text>

      <ProductSelector selected={selectedProduct} onSelect={onSelectProduct} />

      <View className="mt-6 space-y-3">
        <TextInput
          className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
          placeholder="Nicotine per unit (mg)"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={nicotinePerUnit}
          onChangeText={onChangeNicotine}
        />
        <TextInput
          className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
          placeholder="Amount"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={amount}
          onChangeText={onChangeAmount}
        />
        <TextInput
          className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
          placeholder={`Price per unit (${DISPLAY_CURRENCY})`}
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={pricePerUnit}
          onChangeText={onChangePrice}
        />
        {preview && (
          // Live preview of totals so users see what will be saved.
          <Text className="text-center text-sm text-primary">
            This entry: {preview.totalMg.toFixed(1)} mg ·{' '}
            {preview.totalCost.toFixed(2)} {DISPLAY_CURRENCY}
          </Text>
        )}
      </View>

      {error && (
        // Friendly validation/error feedback.
        <Text className="mt-2 text-center text-sm text-red-600">{error}</Text>
      )}

      <TouchableOpacity
        className="mt-6 rounded-full bg-secondary px-4 py-4 shadow-md"
        onPress={onSubmit}
      >
        <Text className="text-center text-lg font-semibold text-sand">
          Add entry
        </Text>
      </TouchableOpacity>
    </View>
  );
};
