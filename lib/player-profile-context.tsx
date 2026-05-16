"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PlayerProfileContextType {
  selectedPlayerId: string | null
  openProfile: (playerId: string) => void
  closeProfile: () => void
}

const PlayerProfileContext = createContext<PlayerProfileContextType>({
  selectedPlayerId: null,
  openProfile: () => {},
  closeProfile: () => {},
})

export function PlayerProfileProvider({ children }: { children: ReactNode }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  return (
    <PlayerProfileContext.Provider
      value={{
        selectedPlayerId,
        openProfile: (id) => setSelectedPlayerId(id),
        closeProfile: () => setSelectedPlayerId(null),
      }}
    >
      {children}
    </PlayerProfileContext.Provider>
  )
}

export function usePlayerProfile() {
  return useContext(PlayerProfileContext)
}
