declare module 'expo-notifications' {
  // Permission states returned by Expo notifications.
  export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

  // Result describing how a notification should be handled.
  export interface NotificationHandlerResult {
    shouldShowAlert: boolean;
    shouldPlaySound: boolean;
    shouldSetBadge: boolean;
  }

  // Register a handler that decides what to do when a notification arrives.
  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<NotificationHandlerResult>;
  }): void;

  // Ask the user for notification permission.
  export function requestPermissionsAsync(): Promise<{ status: NotificationPermissionStatus }>;

  // Remove every scheduled local notification.
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;

  // Schedule a repeating local notification with content and time trigger.
  export function scheduleNotificationAsync(config: {
    content: { title: string; body?: string };
    trigger:
      | { hour: number; minute: number; repeats: boolean }
      | { seconds: number; repeats?: boolean }
      | null;
  }): Promise<string>;

  // Immediately present a local notification without scheduling.
  export function presentNotificationAsync(config: {
    title: string;
    body?: string;
  }): Promise<void>;
}
