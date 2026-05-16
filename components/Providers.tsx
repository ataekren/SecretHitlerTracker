"use client"

import { FirebaseDataProvider } from "@/lib/firebase-context"
import { PlayerProfileProvider } from "@/lib/player-profile-context"
import { PlayerProfile } from "@/components/PlayerProfile"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseDataProvider>
      <PlayerProfileProvider>
        {children}
        <PlayerProfile />
      </PlayerProfileProvider>
    </FirebaseDataProvider>
  )
}
