import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryForm } from '../components/home/EntryForm';
import { SummaryCard } from '../components/home/SummaryCard';
import { TodayEntries } from '../components/home/TodayEntries';
import { useNicotine } from '../contexts/NicotineContext';
import { ProductType } from '../types/nicotine';

type SoundRef = Audio.Sound | null;

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
            baseCurrency={baseCurrency}
            dailyLimitMg={dailyLimitMg}
            limitProgress={limitProgress}
          />

          <EntryForm
            baseCurrency={baseCurrency}
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

          <TodayEntries entries={todayEntries} baseCurrency={baseCurrency} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
