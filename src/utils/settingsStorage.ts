import AsyncStorage from '@react-native-async-storage/async-storage';

import { NicotineSettings } from '../types/nicotine';

const SETTINGS_KEY = 'NICLOG_SETTINGS_V1';

export const defaultSettings: NicotineSettings = {
  dailyLimitMg: null,
  baseCurrency: 'EUR',
  dailyReminderEnabled: false,
  reminderHour: 20,
  reminderHours: [20],
  reminderTimes: ['20:00'],
  currencyRates: null,
};

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

export const saveSettings = async (
  settings: NicotineSettings,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save nicotine settings', error);
  }
};
