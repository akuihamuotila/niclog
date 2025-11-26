import * as Notifications from 'expo-notifications';

export const setupNotificationHandler = () => {
  if (
    !Notifications ||
    typeof Notifications.setNotificationHandler !== 'function'
  ) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const scheduleDailyReminders = async (
  times: string[],
): Promise<string[] | null> => {
  try {
    if (!times.length) return null;
    if (
      !Notifications ||
      typeof Notifications.scheduleNotificationAsync !== 'function'
    ) {
      return null;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const ids: string[] = [];
    for (const time of times) {
      const [hourStr, minuteStr] = time.split(':');
      const hour = Number.parseInt(hourStr, 10);
      const minute = Number.parseInt(minuteStr ?? '0', 10);
      const safeHour = Number.isNaN(hour) ? 20 : Math.max(0, Math.min(23, hour));
      const safeMinute = Number.isNaN(minute)
        ? 0
        : Math.max(0, Math.min(59, minute));

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'NicLog reminder',
          body: 'Remember to log your nicotine use today.',
        },
        trigger: {
          hour: safeHour,
          minute: safeMinute,
          repeats: true,
        },
      });
      ids.push(id);
    }
    return ids;
  } catch (error) {
    console.error('Failed to schedule daily reminders', error);
    return null;
  }
};

export const cancelDailyReminder = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel daily reminder', error);
  }
};
