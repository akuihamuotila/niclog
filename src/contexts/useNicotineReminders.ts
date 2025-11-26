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
    const syncReminders = async () => {
      if (state.settings.dailyReminderEnabled) {
        const times: string[] =
          state.settings.reminderTimes?.length && state.settings.reminderTimes[0]
            ? state.settings.reminderTimes
            : defaultSettings.reminderTimes;
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
