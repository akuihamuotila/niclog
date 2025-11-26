import { useEffect } from 'react';

import { NicotineState } from '../types/nicotine';
import { defaultSettings } from '../utils/settingsStorage';
import { cancelDailyReminder, scheduleDailyReminders } from '../utils/reminders';

interface Params {
  state: NicotineState;
  isLoading: boolean;
}

export const useNicotineReminders = ({ state, isLoading }: Params) => {
  useEffect(() => {
    if (isLoading) return;
    // Mirror reminder settings into scheduled notifications whenever they change.
    const syncReminders = async () => {
      if (state.settings.dailyReminderEnabled) {
        const fallbackTimes = defaultSettings.reminderTimes ?? [];
        const times =
          state.settings.reminderTimes?.length &&
          state.settings.reminderTimes[0]
            ? state.settings.reminderTimes
            : fallbackTimes;
        await scheduleDailyReminders(times);
      } else {
        await cancelDailyReminder();
      }
    };

    syncReminders();
  }, [
    isLoading,
    state.settings.dailyReminderEnabled,
    state.settings.reminderHour,
    state.settings.reminderHours,
    state.settings.reminderTimes,
  ]);
};
