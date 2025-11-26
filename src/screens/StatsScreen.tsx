import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyBreakdown } from '../components/stats/DailyBreakdown';
import { RangeOptionItem, RangeSelector } from '../components/stats/RangeSelector';
import { StatsChart } from '../components/stats/StatsChart';
import { StatsSummaryCard } from '../components/stats/StatsSummaryCard';
import { useNicotine } from '../contexts/NicotineContext';
import {
  RangeOption,
  buildDailyTotals,
  getDateKey,
  summarizeDailyTotals,
} from '../utils/stats';

const PRODUCT_OPTIONS = [
  'snus',
  'pouch',
  'vape',
  'cigarette',
  'other',
] as const;

const RANGE_OPTIONS: RangeOptionItem[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '180d', value: 180 },
  { label: '365d', value: 365 },
  { label: 'All', value: 'all' },
];

export const StatsScreen = () => {
  const { state, updateEntry, addEntry, deleteEntryById } = useNicotine();
  const [range, setRange] = useState<RangeOption>(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editNicotine, setEditNicotine] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [addNicotine, setAddNicotine] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addProduct, setAddProduct] = useState<(typeof PRODUCT_OPTIONS)[number]>('other');

  const dailyTotals = useMemo(
    () =>
      buildDailyTotals(
        state.entries,
        range,
        state.settings.baseCurrency,
        state.settings.currencyRates,
      ),
    [state.entries, range, state.settings.baseCurrency, state.settings.currencyRates],
  );

  const summary = useMemo(() => summarizeDailyTotals(dailyTotals), [dailyTotals]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof state.entries>();
    state.entries.forEach((entry) => {
      const key = getDateKey(new Date(entry.timestamp));
      const list = map.get(key) ?? [];
      list.push(entry);
      list.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      map.set(key, list);
    });
    return map;
  }, [state.entries]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditNicotine('');
    setEditAmount('');
    setEditPrice('');
    setEditError(null);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntryById(entryId);
      if (editingEntryId === entryId) {
        handleCancelEdit();
      }
    } catch (error) {
      setEditError('Failed to delete entry.');
    }
  };

  const startEditing = (entryId: string) => {
    const entry = state.entries.find((e) => e.id === entryId);
    if (!entry) return;
    setEditingEntryId(entry.id);
    setEditNicotine(entry.nicotinePerUnitMg.toString());
    setEditAmount(entry.amount.toString());
    setEditPrice(entry.pricePerUnit.toString());
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editingEntryId) return;
    const baseEntry = state.entries.find((e) => e.id === editingEntryId);
    if (!baseEntry) return;
    const nicotineVal = parseFloat(editNicotine);
    const amountVal = parseFloat(editAmount);
    const priceVal = parseFloat(editPrice);
    if (
      Number.isNaN(nicotineVal) ||
      Number.isNaN(amountVal) ||
      Number.isNaN(priceVal) ||
      nicotineVal <= 0 ||
      amountVal <= 0 ||
      priceVal < 0
    ) {
      setEditError('Use valid numbers for nicotine, amount, and price.');
      return;
    }
    try {
      await updateEntry({
        ...baseEntry,
        nicotinePerUnitMg: nicotineVal,
        amount: amountVal,
        pricePerUnit: priceVal,
      });
      setEditingEntryId(null);
    } catch (error) {
      setEditError('Failed to update entry. Please try again.');
    }
  };

  const addEntryForDate = async () => {
    if (!selectedDate) return;
    const nicotineVal = parseFloat(addNicotine);
    const amountVal = parseFloat(addAmount);
    const priceVal = parseFloat(addPrice);
    if (
      Number.isNaN(nicotineVal) ||
      Number.isNaN(amountVal) ||
      Number.isNaN(priceVal) ||
      nicotineVal <= 0 ||
      amountVal <= 0 ||
      priceVal < 0
    ) {
      setAddError('Use valid numbers for nicotine, amount, and price.');
      return;
    }

    try {
      const parts = selectedDate.split('-').map((p) => Number.parseInt(p, 10));
      const stamp = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
        .toISOString();
      await addEntry({
        productType: addProduct,
        nicotinePerUnitMg: nicotineVal,
        amount: amountVal,
        pricePerUnit: priceVal,
        timestamp: stamp,
      });
      setAddNicotine('');
      setAddAmount('');
      setAddPrice('');
      setAddError(null);
    } catch (error) {
      setAddError('Failed to add entry for this date.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          <StatsSummaryCard
            summary={summary}
            range={range}
            currency={state.settings.baseCurrency}
          />

          <RangeSelector
            options={RANGE_OPTIONS}
            selected={range}
            onSelect={setRange}
          />

          <StatsChart dailyTotals={dailyTotals} range={range} />

          <DailyBreakdown
            dailyTotals={dailyTotals}
            baseCurrency={state.settings.baseCurrency}
            selectedDate={selectedDate}
            entriesByDate={entriesByDate}
            onSelectDate={(date) => {
              handleCancelEdit();
              setSelectedDate(date);
              setEditError(null);
            }}
            formatDate={formatDate}
            productOptions={PRODUCT_OPTIONS}
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
            onChangeAddProduct={setAddProduct}
            onChangeAddNicotine={setAddNicotine}
            onChangeAddAmount={setAddAmount}
            onChangeAddPrice={setAddPrice}
            onAddEntry={addEntryForDate}
            onStartEdit={(entryId) => startEditing(entryId)}
            onChangeEditNicotine={setEditNicotine}
            onChangeEditAmount={setEditAmount}
            onChangeEditPrice={setEditPrice}
            onSaveEdit={saveEdit}
            onDeleteEntry={handleDeleteEntry}
            onCancelEdit={handleCancelEdit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
