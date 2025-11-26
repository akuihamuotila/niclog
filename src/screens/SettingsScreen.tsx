import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyCard } from '../components/settings/CurrencyCard';
import { LimitCard } from '../components/settings/LimitCard';
import { RemindersCard } from '../components/settings/RemindersCard';
import { useNicotine } from '../contexts/NicotineContext';

const CURRENCIES = ['EUR', 'USD', 'SEK', 'NOK'];

const formatTime = (time: string) => {
  const [h, m = '00'] = time.split(':');
  const hour = Math.max(0, Math.min(23, Number.parseInt(h, 10) || 0));
  const minute = Math.max(0, Math.min(59, Number.parseInt(m, 10) || 0));
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const SettingsScreen = () => {
  const {
    state,
    setDailyLimit,
    setBaseCurrency,
    setDailyReminder,
    setReminderHour,
    setReminderHours,
    setReminderTimes,
  } = useNicotine();

  const [limitInput, setLimitInput] = useState(
    state.settings.dailyLimitMg?.toString() ?? '',
  );
  const [reminderCount, setReminderCount] = useState(
    state.settings.reminderTimes?.length ??
      state.settings.reminderHours?.length ??
      1,
  );
  const [reminderTimesInput, setReminderTimesInput] = useState<string[]>(
    state.settings.reminderTimes ??
      (state.settings.reminderHours
        ? state.settings.reminderHours.map((h) =>
            `${h.toString().padStart(2, '0')}:00`,
          )
        : ['20:00']),
  );

  useEffect(() => {
    setLimitInput(state.settings.dailyLimitMg?.toString() ?? '');
  }, [state.settings.dailyLimitMg]);

  useEffect(() => {
    const times =
      state.settings.reminderTimes ??
      (state.settings.reminderHours
        ? state.settings.reminderHours.map((h) =>
            `${h.toString().padStart(2, '0')}:00`,
          )
        : [`${state.settings.reminderHour.toString().padStart(2, '0')}:00`]);
    setReminderTimesInput(times);
    setReminderCount(times.length);
  }, [
    state.settings.reminderTimes,
    state.settings.reminderHours,
    state.settings.reminderHour,
  ]);

  const handleLimitChange = (text: string) => {
    setLimitInput(text);
    if (!text.trim()) {
      setDailyLimit(null);
      return;
    }
    const value = parseFloat(text);
    if (!Number.isNaN(value) && value >= 0) {
      setDailyLimit(value);
    }
  };

  const handleReminderCount = (count: number) => {
    const clamped = Math.max(1, Math.min(5, count));
    const times = [...reminderTimesInput];
    while (times.length < clamped) {
      times.push('20:00');
    }
    if (times.length > clamped) {
      times.length = clamped;
    }
    const formatted = times.map(formatTime);
    setReminderCount(formatted.length);
    setReminderTimesInput(formatted);
    setReminderTimes(formatted);
  };

  const handleReminderTimeChange = (text: string, index: number) => {
    const times = [...reminderTimesInput];
    times[index] = text;
    const formatted = times.map(formatTime);
    setReminderCount(formatted.length);
    setReminderTimesInput(formatted);
    setReminderTimes(formatted);
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
          <LimitCard value={limitInput} onChange={handleLimitChange} />

          <CurrencyCard
            currencies={CURRENCIES}
            selected={state.settings.baseCurrency}
            onSelect={setBaseCurrency}
          />

          <RemindersCard
            enabled={state.settings.dailyReminderEnabled}
            reminderCount={reminderCount}
            reminderTimes={reminderTimesInput}
            onToggle={(value) => setDailyReminder(value)}
            onChangeCount={handleReminderCount}
            onChangeTime={handleReminderTimeChange}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
