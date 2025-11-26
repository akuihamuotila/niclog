import { NicotineSettings } from '../types/nicotine';
import { defaultSettings } from '../utils/settingsStorage';

export const mergeSettings = (stored: NicotineSettings | null) => {
  if (!stored) return defaultSettings;

  const reminderHours =
    stored.reminderHours ??
    (stored.reminderHour !== undefined
      ? [stored.reminderHour]
      : defaultSettings.reminderHours);

  const reminderTimes =
    stored.reminderTimes ??
    (stored.reminderHours
      ? stored.reminderHours.map((h) => `${h.toString().padStart(2, '0')}:00`)
      : stored.reminderHour !== undefined
        ? [`${stored.reminderHour.toString().padStart(2, '0')}:00`]
        : defaultSettings.reminderTimes);

  return {
    ...defaultSettings,
    ...stored,
    reminderHours,
    reminderTimes,
  } satisfies NicotineSettings;
};
