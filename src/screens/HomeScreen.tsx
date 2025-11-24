import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNicotine } from '../contexts/NicotineContext';
import { ProductType } from '../types/nicotine';

type SoundRef = Audio.Sound | null;

const PRODUCT_OPTIONS: { label: string; value: ProductType }[] = [
  { label: 'Snus', value: 'snus' },
  { label: 'Pouch', value: 'pouch' },
  { label: 'Vape', value: 'vape' },
  { label: 'Cigarette', value: 'cigarette' },
  { label: 'Other', value: 'other' },
];

const parseNumber = (value: string) => {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isNaN(parsed) ? null : parsed;
};

const isToday = (timestamp: string) => {
  const entryDate = new Date(timestamp);
  const now = new Date();
  return (
    entryDate.getFullYear() === now.getFullYear() &&
    entryDate.getMonth() === now.getMonth() &&
    entryDate.getDate() === now.getDate()
  );
};

export const HomeScreen = () => {
  const { state, addEntry, getTodayTotalCost, getTodayTotalMg } = useNicotine();

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null,
  );
  const [nicotinePerUnit, setNicotinePerUnit] = useState('');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<SoundRef>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/click.wav'),
        );
        if (isMounted) {
          soundRef.current = sound;
        }
      } catch (err) {
        console.warn('Failed to load click sound', err);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const todayEntries = useMemo(
    () => state.entries.filter((entry) => isToday(entry.timestamp)),
    [state.entries],
  );

  const totalMg = getTodayTotalMg();
  const totalCost = getTodayTotalCost();
  const { dailyLimitMg, baseCurrency } = state.settings;

  const limitProgress =
    dailyLimitMg && dailyLimitMg > 0
      ? Math.min((totalMg / dailyLimitMg) * 100, 200)
      : null;

  const nicotineValue = parseNumber(nicotinePerUnit);
  const amountValue = parseNumber(amount);
  const priceValue = parseNumber(pricePerUnit);

  const preview =
    nicotineValue !== null &&
    amountValue !== null &&
    priceValue !== null &&
    nicotineValue > 0 &&
    amountValue > 0 &&
    priceValue >= 0
      ? {
          totalMg: nicotineValue * amountValue,
          totalCost: priceValue * amountValue,
        }
      : null;

  const handleAddEntry = async () => {
    setError(null);
    if (
      !selectedProduct ||
      nicotineValue === null ||
      amountValue === null ||
      priceValue === null ||
      nicotineValue <= 0 ||
      amountValue <= 0 ||
      priceValue < 0
    ) {
      setError('Fill all fields with valid numbers to add an entry.');
      return;
    }

    try {
      await addEntry({
        productType: selectedProduct,
        nicotinePerUnitMg: nicotineValue,
        amount: amountValue,
        pricePerUnit: priceValue,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }

      setNicotinePerUnit('');
      setAmount('');
      setPricePerUnit('');
    } catch (err) {
      console.error('Failed to add entry', err);
      setError('Could not add entry. Please try again.');
    }
  };

  const renderEntry = ({
    item,
  }: {
    item: (typeof todayEntries)[number];
  }) => {
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <View className="mb-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm">
        <Text className="text-sm font-semibold text-primary">
          {time} • {item.productType.charAt(0).toUpperCase()}
          {item.productType.slice(1)}
        </Text>
        <Text className="mt-1 text-sm text-night">
          {item.amount} × {item.nicotinePerUnitMg} mg = {item.totalMg} mg
        </Text>
        <Text className="text-sm text-night">
          {item.amount} × {item.pricePerUnit} {baseCurrency} = {item.totalCost}{' '}
          {baseCurrency}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          gap: 16,
        }}
      >
        <View className="overflow-hidden rounded-3xl bg-primary/90 p-6 shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-sand">
              Keep within daily limit
            </Text>
            {dailyLimitMg ? (
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-semibold text-sand">
                  {dailyLimitMg} mg
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-6 items-center">
            <Text className="text-5xl font-bold text-sand">
              {totalMg.toFixed(1)} mg
            </Text>
            <Text className="mt-2 text-base text-sand/90">
              Today’s cost: {totalCost.toFixed(2)} {baseCurrency}
            </Text>
            {dailyLimitMg ? (
              <Text className="text-sm text-sand/80">
                {limitProgress !== null
                  ? `${Math.min(limitProgress, 100).toFixed(0)}% of limit`
                  : 'Limit set'}
              </Text>
            ) : (
              <Text className="text-sm text-sand/80">
                No daily limit set
              </Text>
            )}
          </View>

          {dailyLimitMg ? (
            <View className="mt-6 h-3 w-full overflow-hidden rounded-full bg-sand/30">
              <View
                className="h-full rounded-full bg-secondary"
                style={{ width: `${limitProgress ?? 0}%` }}
              />
            </View>
          ) : null}

          {dailyLimitMg !== null && totalMg > dailyLimitMg && (
            <Text className="mt-2 text-sm font-semibold text-red-100">
              Daily limit exceeded
            </Text>
          )}
        </View>

        <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
          <Text className="text-center text-xl font-semibold text-night">
            Log new entry
          </Text>

          <View className="mt-5 flex-row flex-wrap justify-center gap-3">
            {PRODUCT_OPTIONS.map((option) => {
              const isSelected = option.value === selectedProduct;
              return (
                <TouchableOpacity
                  key={option.value}
                  className={`w-[30%] min-w-[90px] items-center rounded-2xl px-3 py-3 ${
                    isSelected ? 'bg-secondary' : 'bg-sand'
                  }`}
                  onPress={() => setSelectedProduct(option.value)}
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

          <View className="mt-6 space-y-3">
            <TextInput
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
              placeholder="Nicotine per unit (mg)"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={nicotinePerUnit}
              onChangeText={setNicotinePerUnit}
            />
            <TextInput
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
              placeholder="Amount"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-night shadow-sm"
              placeholder={`Price per unit (${baseCurrency})`}
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
            />
            {preview && (
              <Text className="text-center text-sm text-primary">
                This entry: {preview.totalMg.toFixed(1)} mg ·{' '}
                {preview.totalCost.toFixed(2)} {baseCurrency}
              </Text>
            )}
          </View>

          {error && (
            <Text className="mt-2 text-center text-sm text-red-600">
              {error}
            </Text>
          )}

          <TouchableOpacity
            className="mt-6 rounded-full bg-secondary px-4 py-4 shadow-md"
            onPress={handleAddEntry}
          >
            <Text className="text-center text-lg font-semibold text-sand">
              Add entry
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6 rounded-3xl bg-white/90 p-5 shadow-sm">
          <Text className="text-lg font-semibold text-night">
            Today’s entries
          </Text>
          {todayEntries.length === 0 ? (
            <Text className="mt-2 text-sm text-night/70">
              No entries logged yet.
            </Text>
          ) : (
            <FlatList
              className="mt-3"
              data={todayEntries}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
