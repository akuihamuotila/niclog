import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  deleteEntry as deleteDbEntry,
  insertEntry,
  updateEntry as updateDbEntry,
} from '../db/nicotineDb';
import {
  CurrencyRates,
  NicotineEntry,
  NicotineState
} from '../types/nicotine';
import { defaultSettings } from '../utils/settingsStorage';
import {
  AddEntryInput,
  buildEntry,
  recalcEntryTotals,
} from './nicotineEntries';
import { getDateKey, getTotalsForDay, sanitizeReminderTimes } from './nicotineHelpers';
import { useNicotineBootstrap } from './useNicotineBootstrap';
import { useNicotineRates } from './useNicotineRates';
import { useNicotineReminders } from './useNicotineReminders';
import { usePersistSettings } from './usePersistSettings';

export interface NicotineContextValue {
  state: NicotineState;
  isLoading: boolean;
  addEntry(input: AddEntryInput): Promise<void>;
  updateEntry(entry: NicotineEntry): Promise<void>;
  setDailyLimit(limitMg: number | null): Promise<void>;
  setBaseCurrency(currency: string): Promise<void>;
  setDailyReminder(enabled: boolean): Promise<void>;
  setReminderHour(hour: number): Promise<void>;
  setReminderHours(hours: number[]): Promise<void>;
  setReminderTimes(times: string[]): Promise<void>;
  deleteEntryById(id: string): Promise<void>;
  setCurrencyRates(rates: CurrencyRates): Promise<void>;
  getTodayTotalMg(): number;
  getTodayTotalCost(): number;
  getDailyTotals(
    daysBack: number,
  ): { date: string; totalMg: number; totalCost: number }[];
}

const NicotineContext = createContext<NicotineContextValue | undefined>(
  undefined,
);

export const NicotineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<NicotineState>({
    entries: [],
    settings: defaultSettings,
  });
  const [isLoading, setIsLoading] = useState(true);

  useNicotineBootstrap({ setState, setIsLoading });
  useNicotineRates({ state, isLoading, setState });
  useNicotineReminders({ state, isLoading });
  usePersistSettings({ state, isLoading });

  const addEntry = useCallback(
    async (input: AddEntryInput) => {
      const entry = buildEntry(input, state.settings.baseCurrency);

      try {
        await insertEntry(entry);
        setState((prev) => ({
          ...prev,
          entries: [...prev.entries, entry],
        }));
      } catch (error) {
        console.error('Failed to add nicotine entry', error);
        throw error;
      }
    },
    [state.settings.baseCurrency],
  );

  const updateEntry = useCallback(
    async (entry: NicotineEntry) => {
      const updated = recalcEntryTotals(entry);
      try {
        await updateDbEntry(updated);
        setState((prev) => ({
          ...prev,
          entries: prev.entries.map((e) => (e.id === updated.id ? updated : e)),
        }));
      } catch (error) {
        console.error('Failed to update nicotine entry', error);
        throw error;
      }
    },
    [],
  );

  const setDailyLimit = useCallback(
    async (limitMg: number | null) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, dailyLimitMg: limitMg },
      }));
    },
    [],
  );

  const setBaseCurrency = useCallback(async (currency: string) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        baseCurrency: currency,
        currencyRates: null,
      },
    }));
  }, []);

  const setDailyReminder = useCallback(async (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, dailyReminderEnabled: enabled },
    }));
  }, []);

  const setReminderHour = useCallback(async (hour: number) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        reminderHour: hour,
        reminderHours: [hour],
        reminderTimes: [`${hour.toString().padStart(2, '0')}:00`],
      },
    }));
  }, []);

  const setReminderHours = useCallback(async (hours: number[]) => {
    const safeHours = hours.map((h) => Math.max(0, Math.min(23, Math.round(h))));
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        reminderHours: safeHours,
        reminderTimes: safeHours.map(
          (h) => `${h.toString().padStart(2, '0')}:00`,
        ),
      },
    }));
  }, []);

  const setReminderTimes = useCallback(async (times: string[]) => {
    setState((prev) => {
      const nextTimes = sanitizeReminderTimes(
        times,
        prev.settings.reminderTimes ?? defaultSettings.reminderTimes,
      );
      const nextHours = nextTimes.map((t) =>
        Number.parseInt(t.split(':')[0], 10),
      );
      const nextPrimaryHour =
        nextTimes.length > 0
          ? Number.parseInt(nextTimes[0].split(':')[0], 10)
          : prev.settings.reminderHour;

      return {
        ...prev,
        settings: {
          ...prev.settings,
          reminderTimes: nextTimes,
          reminderHours: nextHours,
          reminderHour: nextPrimaryHour,
        },
      };
    });
  }, []);

  const setCurrencyRates = useCallback(async (rates: CurrencyRates) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, currencyRates: rates },
    }));
  }, []);

  const deleteEntryById = useCallback(async (id: string) => {
    try {
      await deleteDbEntry(id);
      setState((prev) => ({
        ...prev,
        entries: prev.entries.filter((entry) => entry.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete nicotine entry', error);
      throw error;
    }
  }, []);

  const getTodayTotalMg = useCallback(() => {
    const totals = getTotalsForDay(
      new Date(),
      state.entries,
      state.settings.baseCurrency,
      state.settings.currencyRates,
    );
    return totals.totalMg;
  }, [state.entries, state.settings.baseCurrency, state.settings.currencyRates]);

  const getTodayTotalCost = useCallback(() => {
    const totals = getTotalsForDay(
      new Date(),
      state.entries,
      state.settings.baseCurrency,
      state.settings.currencyRates,
    );
    return totals.totalCost;
  }, [state.entries, state.settings.baseCurrency, state.settings.currencyRates]);

  const getDailyTotals = useCallback(
    (daysBack: number) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totals = [];
      for (let i = daysBack - 1; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const { totalMg, totalCost } = getTotalsForDay(
          day,
          state.entries,
          state.settings.baseCurrency,
          state.settings.currencyRates,
        );
        totals.push({
          date: getDateKey(day),
          totalMg,
          totalCost,
        });
      }

      return totals;
    },
    [
      state.entries,
      state.settings.baseCurrency,
      state.settings.currencyRates,
    ],
  );

  const value = useMemo<NicotineContextValue>(
    () => ({
      state,
      isLoading,
      addEntry,
      updateEntry,
      setDailyLimit,
      setBaseCurrency,
      setDailyReminder,
      setReminderHour,
      setReminderHours,
      setReminderTimes,
      deleteEntryById,
      setCurrencyRates,
      getTodayTotalMg,
      getTodayTotalCost,
      getDailyTotals,
    }),
    [
      state,
      isLoading,
      addEntry,
      updateEntry,
      setDailyLimit,
      setBaseCurrency,
      setDailyReminder,
      setReminderHour,
      setReminderHours,
      setReminderTimes,
      deleteEntryById,
      setCurrencyRates,
      getTodayTotalMg,
      getTodayTotalCost,
      getDailyTotals,
    ],
  );

  return (
    <NicotineContext.Provider value={value}>
      {children}
    </NicotineContext.Provider>
  );
};

export const useNicotine = () => {
  const context = useContext(NicotineContext);
  if (!context) {
    throw new Error('useNicotine must be used within a NicotineProvider');
  }
  return context;
};
