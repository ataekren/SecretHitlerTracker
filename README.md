# 🎩 Secret Hitler Game Tracker & Analytics

An advanced, feature-rich web application built with **Next.js**, **Firebase**, and **Tailwind CSS** to track, manage, and deeply analyze match statistics for the popular social deduction board game, *Secret Hitler*. 

This platform moves beyond basic win/loss tracking by introducing ELO rankings, deep performance analytics, duo synergy tracking, and a comprehensive admin dashboard with strict game rule validation.

## ✨ Key Features

### 🏆 ELO-Based Leaderboard
- **Dynamic Ranking:** Players are ranked using a standard ELO system (starting at 1000) that adjusts based on match outcomes and opponents' strength.
- **Win/Loss Streaks:** The leaderboard dynamically detects and displays active hot streaks (🔥) and cold streaks (❄️).

### 📊 Advanced Player Profiles
Clicking on any player opens a highly detailed profile modal containing:
- **ELO History Graph:** A beautiful line chart tracking the player's ELO progression over their entire match history.
- **Activity Frequency (Bar Chart):** A 14-day trailing bar chart visualizing when and how often the player plays.
- **Role Mastery:** Specific win rates and performance metrics when playing as Liberal, Fascist, or Hitler.

### 👯‍♂️ Duo Analytics (Pair Stats)
A specialized analytics engine that analyzes every possible duo combination across all matches to discover:
- **Deadliest Duos:** The players who win the most when playing together.
- **Worst Synergies:** The players who consistently lose when paired together.

### 🛡️ Robust Admin Panel & Validation
- **Game Rule Enforcement:** The "Add Match" form dynamically validates player configurations against official Secret Hitler rules (e.g., exactly 1 Fascist and 1 Hitler for a 5-6 player game).
- **Interactive Error Handling:** Invalid setups prevent submission and provide clear, color-coded tooltips explaining why the setup is illegal.
- **Unique Player Constraints:** The system prevents the creation or renaming of players to duplicate names, entirely eliminating data-entry confusion.

### 🎨 Premium UI/UX
- **Data Visualization:** Built with `recharts` for highly interactive, responsive charts (Line, Bar, and Pie).
- **Modern Aesthetics:** Features a clean, component-based design utilizing Shadcn UI, Lucide Icons, and customized Tailwind typography with subtle UI animations.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, TypeScript
- **UI Components:** Radix UI / Shadcn UI, Recharts, Lucide React
- **Backend & Database:** Firebase Firestore
- **Authentication:** Firebase Auth

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/ataekren/SecretHitlerTracker.git
cd SecretHitlerTracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Firebase Configuration
1. Create a project on the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Email/Password).
3. Copy your Firebase config and create a `.env` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Data Model Structure

**Players (`players` collection):**
- `id`: Firebase document ID
- `name`: Unique player name
- `elo`: Current ELO rating (default: 1000)
- `wins`, `totalGames`: Global match statistics
- `liberalWins`, `fascistWins`, `hitlerWins`: Role-specific wins
- `penaltyCount`: Warning/Penalty tracker

**Matches (`matches` collection):**
- `date`: ISO Timestamp
- `winner`: "Liberal" or "Faşist"
- `players`: Array of objects containing `{ id, name, role }`
