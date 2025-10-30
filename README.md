# 💀 NicLog

**Most details are subject to change.**

**NicLog** is a mobile app built with **Expo**, **React Native**, and **TypeScript** that helps users **track every nicotine use throughout the day** and visualize their habits over time.

---

## 🚀 Core Functionality

NicLog’s main feature is simple and powerful:  
Whenever you use a nicotine product — a pouch, cigarette, or vape session — you **open the app and log it**.  
Each log is saved locally, and over time, the app builds **charts and statistics** that show your total consumption, nicotine intake, and cost trends.

---

## ⚙️ Features

### 🧮 Logging
- Quick input for **product type**, **nicotine per unit**, and **price per unit**  
- Adds an entry every time you log use  
- Stores data locally with **SQLite**, ensuring offline access

### 📊 Statistics
- Displays your data in **interactive charts** (7 / 30 / 90 / 180 / 365 days & all time)  
- Calculates totals, averages, and progress  
- Helps you identify habits and reduction patterns

### 💱 Currency & Cost Tracking
- Shows total daily, monthly and yearly cost  
- Fetches exchange rates from a simple **REST API** (cached 24 h for offline use)

### 🔔 Feedback & Experience
- **Haptic feedback** and **button sound effects** with **expo-haptics** and **expo-av**  
- Optional **daily reminder notification** to log your usage  
- Clean, minimal UI for fast daily interaction

---

## 🧩 Tech Stack

| Category | Technologies |
|-----------|---------------|
| Framework | **Expo**, **React Native**, **TypeScript** |
| Storage | **SQLite** (entries), **AsyncStorage** (settings) |
| Navigation | **@react-navigation/native-stack** |
| Charts | **react-native-svg** |
| Device APIs | **expo-haptics**, **expo-notifications**, **expo-av** |
| Data | Currency rates **REST API** |
| Utilities | **date-fns**, custom hooks & contexts |
| Formatting | **Prettier** |

---

## 💡 Summary

NicLog turns nicotine tracking into a simple daily routine.  
Open it, mark your use, and let it quietly build insight into your habits — helping you **see, understand, and gradually reduce** your nicotine consumption.