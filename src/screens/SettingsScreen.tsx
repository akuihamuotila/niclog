// Settings screen for daily limit and multiple reminder times.
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LimitCard } from '../components/settings/LimitCard';
import { RemindersCard } from '../components/settings/RemindersCard';
import { useNicotine } from '../contexts/NicotineContext';
import { cancelDailyReminder, scheduleDailyReminders } from '../utils/reminders';

// Normalize a HH:MM string into a clamped, padded time.
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
    setDailyReminder,
    setReminderTimes,
  } = useNicotine();

  const [limitInput, setLimitInput] = useState(
    state.settings.dailyLimitMg?.toString() ?? '',
  );
  // Mirror how many reminder slots the user currently has configured.
  const [reminderCount, setReminderCount] = useState(
    state.settings.reminderTimes?.length ??
      state.settings.reminderHours?.length ??
      1,
  );
  // Local editable list of reminder times.
  const [reminderTimesInput, setReminderTimesInput] = useState<string[]>(
    state.settings.reminderTimes ??
      (state.settings.reminderHours
        ? state.settings.reminderHours.map((h) =>
            `${h.toString().padStart(2, '0')}:00`,
          )
        : ['20:00']),
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Keep local input in sync when the stored limit changes.
    setLimitInput(state.settings.dailyLimitMg?.toString() ?? '');
  }, [state.settings.dailyLimitMg]);

  useEffect(() => {
    // Sync local reminder inputs when settings change or legacy fields update.
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
    // Update limit state and persist valid numeric values or null.
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
    // Adjust number of reminder slots while preserving existing times.
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
    // Update a specific reminder time and keep local/context values formatted.
    const times = [...reminderTimesInput];
    times[index] = text;
    const formatted = times.map(formatTime);
    setReminderCount(formatted.length);
    setReminderTimesInput(formatted);
    setReminderTimes(formatted);
  };

  const handleSaveReminders = async () => {
    // Persist formatted reminder times and reschedule notifications using the shared helper.
    const formatted = reminderTimesInput.map(formatTime);
    setReminderTimesInput(formatted);
    setReminderTimes(formatted);
    if (state.settings.dailyReminderEnabled) {
      const ids = await scheduleDailyReminders(formatted);
      if (ids) {
        setStatusMessage('Saved successfully');
      } else {
        setStatusMessage('Notification permissions are required.');
      }
      setTimeout(() => setStatusMessage(null), 2500);
    } else {
      await cancelDailyReminder();
      setStatusMessage('Reminders disabled');
      setTimeout(() => setStatusMessage(null), 2000);
    }
  };

  // Render settings layout with limit and reminder controls.
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

          <RemindersCard
            enabled={state.settings.dailyReminderEnabled}
            reminderCount={reminderCount}
            reminderTimes={reminderTimesInput}
            statusMessage={statusMessage}
            onToggle={(value) => setDailyReminder(value)}
            onChangeCount={handleReminderCount}
            onChangeTime={handleReminderTimeChange}
            onSave={handleSaveReminders}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
