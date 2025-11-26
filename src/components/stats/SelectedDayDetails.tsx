import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { NicotineEntry, ProductType } from '../../types/nicotine';

interface Props {
  dateLabel: string;
  entries: NicotineEntry[];
  baseCurrency: string;
  productOptions: readonly ProductType[];
  addProduct: ProductType;
  addNicotine: string;
  addAmount: string;
  addPrice: string;
  addError: string | null;
  editError: string | null;
  editingEntryId: string | null;
  editNicotine: string;
  editAmount: string;
  editPrice: string;
  onChangeAddProduct: (type: ProductType) => void;
  onChangeAddNicotine: (val: string) => void;
  onChangeAddAmount: (val: string) => void;
  onChangeAddPrice: (val: string) => void;
  onAddEntry: () => void;
  onStartEdit: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onChangeEditNicotine: (val: string) => void;
  onChangeEditAmount: (val: string) => void;
  onChangeEditPrice: (val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const SelectedDayDetails = ({
  dateLabel,
  entries,
  baseCurrency,
  productOptions,
  addProduct,
  addNicotine,
  addAmount,
  addPrice,
  addError,
  editError,
  editingEntryId,
  editNicotine,
  editAmount,
  editPrice,
  onChangeAddProduct,
  onChangeAddNicotine,
  onChangeAddAmount,
  onChangeAddPrice,
  onAddEntry,
  onStartEdit,
  onDeleteEntry,
  onChangeEditNicotine,
  onChangeEditAmount,
  onChangeEditPrice,
  onSaveEdit,
  onCancelEdit,
}: Props) => {
  if (!dateLabel) return null;
  const isEditingCurrentDay =
    editingEntryId && entries.some((entry) => entry.id === editingEntryId);

  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-lg font-semibold text-night">
        Entries on {dateLabel}
      </Text>

      {entries.length === 0 ? (
        <Text className="mt-2 text-sm text-night/70">
          No entries for this day.
        </Text>
      ) : (
        <View className="mt-3 space-y-3">
          {entries.map((entry) => (
            <View
              key={entry.id}
              className="rounded-2xl bg-sand/60 px-4 py-3 shadow-sm"
            >
              <Text className="text-sm font-semibold text-primary">
                {entry.productType} •{' '}
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text className="text-sm text-night">
                {entry.amount} × {entry.nicotinePerUnitMg} mg ={' '}
                {entry.totalMg.toFixed(1)} mg
              </Text>
              <Text className="text-sm text-night">
                {entry.amount} × {entry.pricePerUnit} {baseCurrency} ={' '}
                {entry.totalCost.toFixed(2)} {baseCurrency}
              </Text>
              <View className="mt-2 flex-row gap-2">
                <TouchableOpacity
                  className="rounded-full bg-secondary px-3 py-2"
                  onPress={() => onStartEdit(entry.id)}
                >
                  <Text className="text-sm font-semibold text-sand">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-full bg-red-500 px-3 py-2"
                  onPress={() => onDeleteEntry(entry.id)}
                >
                  <Text className="text-sm font-semibold text-sand">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="mt-4 rounded-2xl bg-white/95 p-3 shadow-sm">
        <Text className="text-sm font-semibold text-night">
          Add new entry for this day
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {productOptions.map((type) => {
            const selected = addProduct === type;
            return (
              <TouchableOpacity
                key={type}
                className={`rounded-full px-3 py-2 ${
                  selected ? 'bg-secondary' : 'bg-sand'
                }`}
                onPress={() => onChangeAddProduct(type)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-sand' : 'text-night'
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="mt-3 space-y-2">
          <TextInput
            className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-night"
            keyboardType="numeric"
            placeholder="Nicotine per unit"
            value={addNicotine}
            onChangeText={onChangeAddNicotine}
          />
          <TextInput
            className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-night"
            keyboardType="numeric"
            placeholder="Amount"
            value={addAmount}
            onChangeText={onChangeAddAmount}
          />
          <TextInput
            className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-night"
            keyboardType="numeric"
            placeholder="Price per unit"
            value={addPrice}
            onChangeText={onChangeAddPrice}
          />
        </View>
        {addError && (
          <Text className="mt-2 text-sm text-red-600">{addError}</Text>
        )}
        <View className="mt-3 flex-row justify-end">
          <TouchableOpacity
            className="rounded-full bg-secondary px-4 py-2"
            onPress={onAddEntry}
          >
            <Text className="text-sm font-semibold text-sand">Add entry</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isEditingCurrentDay && (
        <View className="mt-2 rounded-2xl bg-white/95 p-3 shadow-sm">
          <Text className="text-sm font-semibold text-night">Edit entry</Text>
          <View className="mt-2 space-y-2">
            <TextInput
              className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-night"
              keyboardType="numeric"
              placeholder="Nicotine per unit"
              value={editNicotine}
              onChangeText={onChangeEditNicotine}
            />
            <TextInput
              className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-night"
              keyboardType="numeric"
              placeholder="Amount"
              value={editAmount}
              onChangeText={onChangeEditAmount}
            />
            <TextInput
              className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-night"
              keyboardType="numeric"
              placeholder="Price per unit"
              value={editPrice}
              onChangeText={onChangeEditPrice}
            />
          </View>
          {editError && (
            <Text className="mt-2 text-sm text-red-600">{editError}</Text>
          )}
          <View className="mt-3 flex-row justify-end gap-2">
            <TouchableOpacity
              className="rounded-full bg-sand px-4 py-2"
              onPress={onCancelEdit}
            >
              <Text className="text-sm font-semibold text-night">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-full bg-secondary px-4 py-2"
              onPress={onSaveEdit}
            >
              <Text className="text-sm font-semibold text-sand">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
