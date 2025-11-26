import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  enabled: boolean;
  reminderCount: number;
  reminderTimes: string[];
  onToggle: (val: boolean) => void;
  onChangeCount: (count: number) => void;
  onChangeTime: (text: string, idx: number) => void;
}

export const RemindersCard = ({
  enabled,
  reminderCount,
  reminderTimes,
  onToggle,
  onChangeCount,
  onChangeTime,
}: Props) => {
  const [iosPickerIndex, setIosPickerIndex] = useState<number | null>(null);
  const [iosPickerTime, setIosPickerTime] = useState<Date>(new Date());

  const parseTimeToDate = (time: string) => {
    const [h, m = '0'] = time.split(':');
    const hour = Math.max(0, Math.min(23, Number.parseInt(h, 10) || 0));
    const minute = Math.max(0, Math.min(59, Number.parseInt(m, 10) || 0));
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const formatDateToTime = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  const openTimePicker = (index: number, current: string) => {
    const initialDate = parseTimeToDate(current);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'time',
        is24Hour: true,
        onChange: (_, date) => {
          if (date) {
            onChangeTime(formatDateToTime(date), index);
          }
        },
      });
    } else {
      setIosPickerIndex(index);
      setIosPickerTime(initialDate);
    }
  };

  const handleIosChange = (_: any, date?: Date) => {
    if (date !== undefined && iosPickerIndex !== null) {
      onChangeTime(formatDateToTime(date), iosPickerIndex);
      setIosPickerTime(date);
    }
  };

  return (
    <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
      <Text className="text-xl font-semibold text-night">Daily reminder</Text>
      <Text className="mt-1 text-sm text-night/70">
        Get a gentle nudge to log your day.
      </Text>

      <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-sand/60 px-4 py-3">
        <Text className="text-base text-night">Enable reminder</Text>
        <Switch
          trackColor={{ false: '#cbd5e1', true: '#1abc9c' }}
          thumbColor="#ffffff"
          value={enabled}
          onValueChange={onToggle}
        />
      </View>

      <View className="mt-4">
        <Text className="text-base text-night">Reminders per day</Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((count) => {
            const selected = reminderCount === count;
            return (
              <TouchableOpacity
                key={count}
                className={`rounded-full px-3 py-2 ${
                  selected ? 'bg-secondary' : 'bg-sand'
                }`}
                onPress={() => onChangeCount(count)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-sand' : 'text-night'
                  }`}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-3 space-y-2">
          {reminderTimes.slice(0, reminderCount).map((time, idx) => (
            <View key={`reminder-${idx}`} className="flex-row items-center gap-2">
              <Text className="w-16 text-base text-night">Time {idx + 1}</Text>
              <TouchableOpacity
                className={`flex-1 rounded-2xl border border-primary/10 bg-white px-4 py-3 ${
                  enabled ? '' : 'opacity-60'
                }`}
                activeOpacity={0.8}
                disabled={!enabled}
                onPress={() => openTimePicker(idx, time)}
              >
                <Text className="text-base text-night">{time}</Text>
              </TouchableOpacity>
            </View>
          ))}
          {Platform.OS === 'ios' && iosPickerIndex !== null && (
            <View className="mt-2 rounded-2xl bg-white/80 p-2">
              <DateTimePicker
                value={iosPickerTime}
                mode="time"
                display="spinner"
                onChange={handleIosChange}
                textColor="#1b3a4b"
              />
              <TouchableOpacity
                className="mt-2 self-end rounded-full bg-secondary px-3 py-2"
                onPress={() => setIosPickerIndex(null)}
              >
                <Text className="text-sm font-semibold text-sand">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
