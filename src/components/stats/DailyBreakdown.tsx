// Accordion-style list of days that expands to view, add, and edit entries.
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { NicotineEntry, ProductType } from '../../types/nicotine';
import { SelectedDayDetails } from './SelectedDayDetails';
import { DailyTotal } from '../../utils/stats';

interface Props {
  dailyTotals: DailyTotal[];
  selectedDate: string | null;
  entriesByDate: Map<string, NicotineEntry[]>;
  onSelectDate: (date: string) => void;
  formatDate: (dateString: string) => string;
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
  onChangeAddProduct: (value: ProductType) => void;
  onChangeAddNicotine: (val: string) => void;
  onChangeAddAmount: (val: string) => void;
  onChangeAddPrice: (val: string) => void;
  onAddEntry: () => void;
  onStartEdit: (entryId: string) => void;
  onChangeEditNicotine: (val: string) => void;
  onChangeEditAmount: (val: string) => void;
  onChangeEditPrice: (val: string) => void;
  onSaveEdit: () => void;
  onDeleteEntry: (entryId: string) => void;
  onCancelEdit: () => void;
}

export const DailyBreakdown = ({
  dailyTotals,
  selectedDate,
  entriesByDate,
  onSelectDate,
  formatDate,
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
  onChangeEditNicotine,
  onChangeEditAmount,
  onChangeEditPrice,
  onSaveEdit,
  onDeleteEntry,
  onCancelEdit,
}: Props) => {
  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-lg font-semibold text-night">Daily breakdown</Text>
      {dailyTotals.length === 0 ? (
        <Text className="mt-2 text-sm text-night/70">
          No entries logged in this range.
        </Text>
      ) : (
        <FlatList
          className="mt-3"
          data={[...dailyTotals].sort((a, b) => b.date.localeCompare(a.date))}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => {
            const isSelected = selectedDate === item.date;
            const entriesForDay = entriesByDate.get(item.date) ?? [];
            return (
              <View className="mb-3 rounded-2xl bg-sand/60 px-4 py-3">
                <TouchableOpacity onPress={() => onSelectDate(item.date)}>
                  <Text className="text-sm font-semibold text-primary">
                    {formatDate(item.date)}
                  </Text>
                  <Text className="text-sm text-night">
                    {item.totalMg.toFixed(1)} mg
                  </Text>
                  <Text className="text-sm text-night">
                    {item.totalCost.toFixed(2)} EUR
                  </Text>
                  <Text className="mt-1 text-xs text-primary">
                    Tap to view entries
                  </Text>
                </TouchableOpacity>
                {isSelected && (
                  <View className="mt-3">
                    <SelectedDayDetails
                      dateLabel={formatDate(item.date)}
                      entries={entriesForDay}
                      productOptions={productOptions}
                      addProduct={addProduct}
                      addNicotine={addNicotine}
                      addAmount={addAmount}
                      addPrice={addPrice}
                      addError={addError}
                      editError={editError}
                      editingEntryId={editingEntryId}
                      editNicotine={editNicotine}
                      editAmount={editAmount}
                      editPrice={editPrice}
                      onChangeAddProduct={onChangeAddProduct}
                      onChangeAddNicotine={onChangeAddNicotine}
                      onChangeAddAmount={onChangeAddAmount}
                      onChangeAddPrice={onChangeAddPrice}
                      onAddEntry={onAddEntry}
                      onStartEdit={onStartEdit}
                      onDeleteEntry={onDeleteEntry}
                      onChangeEditNicotine={onChangeEditNicotine}
                      onChangeEditAmount={onChangeEditAmount}
                      onChangeEditPrice={onChangeEditPrice}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                    />
                  </View>
                )}
              </View>
            );
          }}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};
