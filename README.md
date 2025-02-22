# Secret Hitler Game Tracking App

This project is a web application built with Next.js and Firebase to manage and display statistics for the game Secret Hitler. It allows administrators to add players and record match results, and provides a leaderboard and role-based statistics for players.

## Features

*   **Admin Panel:**
    *   Add new players to the database.
    *   Record match results, including the winning role and participating players with their roles.
*   **Leaderboard:** Displays a ranked list of players based on their ELO rating, including their win rate and total games played.
*   **Role Statistics:** Provides statistics for each role (Liberal, Fascist, Hitler), showing the win rates for players in those roles.
*   **Match List:** Lists recent matches with dates, winning roles, and participants.
*   **Authentication:** Admin login to protect the admin panel.

## Motivation
As passionate Secret Hitler players, we often struggled to keep track of our match results, individual player statistics and overall win rates. To solve this, I implemented a centralized platform that allows us to record game outcomes, analyze performance and gain deeper insights into our gameplay.

## Technologies Used

*   **Next.js:** A React framework for building server-rendered web applications.
*   **Firebase:** A platform for building web and mobile applications, providing authentication, database (Firestore), and hosting services.
*   **React Firebase Hooks:** Useful React hooks for Firebase.
*   **Tailwind CSS:** A utility-first CSS framework for styling the application.
*   **Radix UI:** A set of unstyled, accessible UI primitives.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ataekren/SecretHitlerTracker
    cd secret-hitler-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Firebase:**

    *   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable Authentication (Email/Password).
    *   Create a Firestore database.
    *   Obtain your Firebase configuration.

4.  **Configure environment variables:**

    *   Create a `.env` file in the project root.
    *   Add your Firebase configuration to the `.env` file:

        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=<your_api_key>
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_messaging_sender_id>
        NEXT_PUBLIC_FIREBASE_APP_ID=<your_app_id>
        ```

5.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Data Model

*   **Players:**
    *   `id` (string): Firebase document ID.
    *   `name` (string): Player's name.
    *   `wins` (number): Total wins.
    *   `totalGames` (number): Total games played.
    *   `elo` (number): ELO rating.
    *   `liberalGames` (number): Number of games played as Liberal.
    *   `liberalWins` (number): Number of games won as Liberal.
    *   `fascistGames` (number): Number of games played as Fascist.
    *   `fascistWins` (number): Number of games won as Fascist.
    *   `hitlerGames` (number): Number of games played as Hitler.
    *   `hitlerWins` (number): Number of games won as Hitler.
*   **Matches:**
    *   `id` (string): Firebase document ID.
    *   `date` (string): Date and time of the match (ISO string).
    *   `winner` (string): Winning role (Liberal or Fascist).
    *   `players` (array): Array of players with their names and roles.

## Key Components

*   `app/page.tsx`: Main landing page displaying the Leaderboard, RoleStats, and MatchList.
*   `app/admin/page.tsx`: Admin panel for adding players and match results. Requires authentication.
*   `app/login/page.tsx`: Login page for administrators.
*   `components/AddPlayerForm.tsx`: Component for adding new players.
*   `components/AddMatchForm.tsx`: Component for adding new match results.
*   `components/Leaderboard.tsx`: Component displaying the player leaderboard.
*   `components/RoleStats.tsx`: Component displaying role-based statistics.
*   `components/MatchList.tsx`: Component displaying the list of recent matches.
*   `components/Navbar.tsx`: Navigation bar with links and authentication status.
*   `lib/firebase.ts`: Firebase initialization and configuration.

