import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { NicotineEntry, NicotineState } from '../types/nicotine';
import { defaultSettings } from '../utils/settingsStorage';
import {
  AddEntryInput,
  buildEntry,
  recalcEntryTotals,
} from './nicotineEntries';
import { getDateKey, getTotalsForDay, sanitizeReminderTimes } from './nicotineHelpers';
import { useNicotineBootstrap } from './useNicotineBootstrap';
import { useNicotineReminders } from './useNicotineReminders';
import { usePersistSettings } from './usePersistSettings';
import { nicotineService } from '../services/nicotineService';

export interface NicotineContextValue {
  state: NicotineState;
  isLoading: boolean;
  addEntry(input: AddEntryInput): Promise<void>;
  updateEntry(entry: NicotineEntry): Promise<void>;
  setDailyLimit(limitMg: number | null): Promise<void>;
  setDailyReminder(enabled: boolean): Promise<void>;
  setReminderHour(hour: number): Promise<void>;
  setReminderHours(hours: number[]): Promise<void>;
  setReminderTimes(times: string[]): Promise<void>;
  deleteEntryById(id: string): Promise<void>;
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
  // Hold global nicotine entries and settings for the app.
  const [state, setState] = useState<NicotineState>({
    entries: [],
    settings: defaultSettings,
  });
  const [isLoading, setIsLoading] = useState(true);

  useNicotineBootstrap({ setState, setIsLoading });
  useNicotineReminders({ state, isLoading });
  usePersistSettings({ state, isLoading });

  const addEntry = useCallback(
    async (input: AddEntryInput) => {
      // Build a new entry with totals, persist it, and sync state.
      const entry = buildEntry(input);

      try {
        await nicotineService.add(entry);
        setState((prev) => ({
          ...prev,
          entries: [...prev.entries, entry],
        }));
      } catch (error) {
        console.error('Failed to add nicotine entry', error);
        throw error;
      }
    },
    [],
  );

  const updateEntry = useCallback(
    async (entry: NicotineEntry) => {
      // Recalculate totals for an edited entry and persist changes.
      const updated = recalcEntryTotals(entry);
      try {
        await nicotineService.update(updated);
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
      // Update the optional daily nicotine cap in settings.
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, dailyLimitMg: limitMg },
      }));
    },
    [],
  );

  const setDailyReminder = useCallback(async (enabled: boolean) => {
    // Enable or disable daily reminder scheduling.
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, dailyReminderEnabled: enabled },
    }));
  }, []);

  const setReminderHour = useCallback(async (hour: number) => {
    // Set a single reminder hour and keep derived hour/time lists in sync.
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
    // Accept multiple reminder hours, clamp them, and derive HH:00 strings.
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
    // Accept HH:MM strings, sanitize them, and align hour fields.
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

  const deleteEntryById = useCallback(async (id: string) => {
    // Remove a single entry from storage and local state.
    try {
      await nicotineService.deleteById(id);
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
    // Sum nicotine mg for the current local day.
    const totals = getTotalsForDay(new Date(), state.entries);
    return totals.totalMg;
  }, [state.entries]);

  const getTodayTotalCost = useCallback(() => {
    // Sum spending for the current local day in EUR.
    const totals = getTotalsForDay(new Date(), state.entries);
    return totals.totalCost;
  }, [state.entries]);

  const getDailyTotals = useCallback(
    (daysBack: number) => {
      // Build a fixed-length list of daily totals for charting.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totals = [];
      for (let i = daysBack - 1; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const { totalMg, totalCost } = getTotalsForDay(day, state.entries);
        totals.push({
          date: getDateKey(day),
          totalMg,
          totalCost,
        });
      }

      return totals;
    },
    [state.entries],
  );

  const value = useMemo<NicotineContextValue>(
    () => ({
      state,
      isLoading,
      addEntry,
      updateEntry,
      setDailyLimit,
      setDailyReminder,
      setReminderHour,
      setReminderHours,
      setReminderTimes,
      deleteEntryById,
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
      setDailyReminder,
      setReminderHour,
      setReminderHours,
      setReminderTimes,
      deleteEntryById,
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
