declare module 'expo-notifications' {
  export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

  export interface NotificationHandlerResult {
    shouldShowAlert: boolean;
    shouldPlaySound: boolean;
    shouldSetBadge: boolean;
  }

  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<NotificationHandlerResult>;
  }): void;

  export function requestPermissionsAsync(): Promise<{ status: NotificationPermissionStatus }>;

  export function cancelAllScheduledNotificationsAsync(): Promise<void>;

  export function scheduleNotificationAsync(config: {
    content: { title: string; body?: string };
    trigger: { hour: number; minute: number; repeats: boolean };
  }): Promise<string>;
}
