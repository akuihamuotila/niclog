// Home screen showing today's intake summary, logging form, and today's entries list.
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyTipCard } from '../components/home/DailyTipCard';
import { EntryForm } from '../components/home/EntryForm';
import { SummaryCard } from '../components/home/SummaryCard';
import { TodayEntries } from '../components/home/TodayEntries';
import { useNicotine } from '../contexts/NicotineContext';
import { useDailyQuote } from '../hooks/useDailyQuote';
import { ProductType } from '../types/nicotine';

type SoundRef = Audio.Sound | null;

// Parse locale-friendly numeric input (commas allowed) into a number or null.
const parseNumber = (value: string) => {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isNaN(parsed) ? null : parsed;
};

// Check if a timestamp falls on the current local day.
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
  const { quote, refreshQuote } = useDailyQuote();

  // Local form state for the entry being created.
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

    // Preload the click sound for instant feedback.
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
      // Release sound resources when unmounting.
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Memoize today's entries so renders stay cheap.
  const todayEntries = useMemo(
    () => state.entries.filter((entry) => isToday(entry.timestamp)),
    [state.entries],
  );

  const totalMg = getTodayTotalMg();
  const totalCost = getTodayTotalCost();
  const { dailyLimitMg } = state.settings;

  // Track progress toward the optional daily limit (capped at 200% for bar overflow).
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
    // Validate input, persist the entry, and provide haptic/sound feedback.
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
        pricePerUnitEur: priceValue,
      });
      refreshQuote();

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

  // Render the main home layout with summary, form, and today's entries.
  return (
    <SafeAreaView className="flex-1 bg-sand">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 20,
            gap: 16,
          }}
        >
          <SummaryCard
            totalMg={totalMg}
            totalCost={totalCost}
            dailyLimitMg={dailyLimitMg}
            limitProgress={limitProgress}
          />

          <DailyTipCard quote={quote} />

          <EntryForm
            selectedProduct={selectedProduct}
            nicotinePerUnit={nicotinePerUnit}
            amount={amount}
            pricePerUnit={pricePerUnit}
            preview={preview}
            error={error}
            onSelectProduct={setSelectedProduct}
            onChangeNicotine={setNicotinePerUnit}
            onChangeAmount={setAmount}
            onChangePrice={setPricePerUnit}
            onSubmit={handleAddEntry}
          />

          <TodayEntries entries={todayEntries} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
