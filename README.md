# NicLog

NicLog is a mobile app built with Expo + React Native that helps people log every nicotine use, track spending in EUR, and see habits over time. All data stays on-device (SQLite for entries, AsyncStorage for settings) with optional daily reminders and a small external “Daily tip” pulled from a public API (with offline fallback).

## 🚀 Core Features

The app focuses on a single user role: anyone who wants to monitor and reduce nicotine use.

### Logging & Tracking
* Quick entry for product type (snus, pouch, vape, cigarette, other), nicotine per unit, amount, and price.
* Stores entries locally in SQLite for offline use; recalculates totals on edits.
* Optional daily reminders via Expo Notifications to prompt logging.

### Insights & Progress
* Daily summary shows total nicotine (mg), cost (EUR) with limit progress, and a refreshed “Daily tip” quote (offline fallback; refreshes when opening the screen or adding an entry).
* Stats screen charts daily mg over 7/30/90/180/365 days or all time and lists per-day breakdowns.

### Experience
* Haptic and sound feedback when adding entries.
* Simple, touch-friendly UI built for fast daily use.

## 🛠 Technology Stack

### Mobile App
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Navigation](https://img.shields.io/badge/React_Navigation-000000?style=for-the-badge&logo=react&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-000000?style=for-the-badge&logo=react&logoColor=white)
![expo-notifications](https://img.shields.io/badge/Expo_Notifications-FFBA08?style=for-the-badge&logo=bell&logoColor=white)
![react-native-svg](https://img.shields.io/badge/react--native--svg-0F7A94?style=for-the-badge&logo=svg&logoColor=white)
![Reanimated](https://img.shields.io/badge/Reanimated-1C1E24?style=for-the-badge&logo=react&logoColor=61DAFB)
![Gesture Handler](https://img.shields.io/badge/Gesture_Handler-1C1E24?style=for-the-badge&logo=react&logoColor=61DAFB)

### Libraries & APIs
- Navigation: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@react-navigation/elements`
- UI/styling: `nativewind`, Tailwind classes, `react-native-safe-area-context`, `react-native-screens`
- Storage: `expo-sqlite` for entries, `@react-native-async-storage/async-storage` for settings
- Notifications & feedback: `expo-notifications`, `expo-haptics`, `expo-av`
- Charts & visuals: `react-native-svg`
- Core React Native stack: `react-native-gesture-handler`, `react-native-reanimated`
- Utilities & Expo modules: `expo-constants`, `expo-font`, `expo-image`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`, `expo-system-ui`, `expo-web-browser`
- External data: public quote API `https://api.quotable.io/random` for the Daily Tip card

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`) or use `npx expo start`
- iOS Simulator (Xcode), Android Emulator, or Expo Go on a device

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npx expo start
   ```
3. Run on a device/emulator:
   - Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## 🧪 Testing

No automated tests yet. Run linting with:
```bash
npm run lint
```

## 📂 Project Structure

```
NicLog/
├── App.tsx                     # Navigation setup
├── src/
│   ├── components/             # UI building blocks (home, stats, settings)
│   ├── contexts/               # State and actions (entries/settings/reminders), bootstrap/persist hooks
│   ├── db/                     # SQLite helpers for nicotine entries
│   ├── hooks/                  # Reusable hooks (e.g., daily quote)
│   ├── screens/                # Home, Stats, Settings screens
│   ├── services/               # Data services (nicotine persistence, quote fetch)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Common helpers (reminders, settings storage, stats, currency label)
├── assets/                     # Icons, sounds, images
└── scripts/                    # Tooling (e.g., reset-project)
```

## 👥 Author

* Aku Ihamuotila

## 🔒 Notes on Data & Privacy

- Entries and settings are stored locally on the device (SQLite + AsyncStorage).
- Notifications are local-only and scheduled on device.
