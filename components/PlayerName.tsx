"use client"

import { usePlayerProfile } from "@/lib/player-profile-context"

interface PlayerNameProps {
  playerId: string
  name: string
  className?: string
}

export function PlayerName({ playerId, name, className = "" }: PlayerNameProps) {
  const { openProfile } = usePlayerProfile()

  return (
    <span
      onClick={() => openProfile(playerId)}
      className={`cursor-pointer hover:underline hover:text-primary transition-colors ${className}`}
    >
      {name}
    </span>
  )
}
