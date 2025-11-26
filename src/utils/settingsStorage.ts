// AsyncStorage helpers for nicotine settings with defaults.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NicotineSettings } from '../types/nicotine';

const SETTINGS_KEY = 'NICLOG_SETTINGS_V1';

// Default nicotine settings used when the user has no saved preferences.
export const defaultSettings: NicotineSettings = {
  dailyLimitMg: null,
  dailyReminderEnabled: false,
  reminderHour: 20,
  reminderHours: [20],
  reminderTimes: ['20:00'],
};

// Read nicotine settings from storage; return null when missing or invalid to allow defaults.
export const loadSettings = async (): Promise<NicotineSettings | null> => {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as NicotineSettings;
  } catch (error) {
    console.error('Failed to load nicotine settings', error);
    return null;
  }
};

// Persist nicotine settings to storage; log errors and keep the UI running.
export const saveSettings = async (
  settings: NicotineSettings,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save nicotine settings', error);
  }
};
