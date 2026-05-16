"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Shared types
export interface Player {
  id: string
  name: string
  wins: number
  totalGames: number
  elo: number
  liberalGames: number
  liberalWins: number
  fascistGames: number
  fascistWins: number
  hitlerGames: number
  hitlerWins: number
  penaltyCount: number
}

export interface Match {
  id: string
  date: string
  winner: string
  players: { id: string; name: string; role: string }[]
}

// Separate contexts to avoid unnecessary re-renders
const PlayersContext = createContext<Player[]>([])
const MatchesContext = createContext<Match[]>([])

export function FirebaseDataProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    // Single listener for players collection (sorted by ELO desc)
    const playersQuery = query(collection(db, "players"), orderBy("elo", "desc"))
    const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player)
      })
      setPlayers(playersData)
    })

    // Single listener for matches collection (sorted by date desc)
    const matchesQuery = query(collection(db, "matches"), orderBy("date", "desc"))
    const unsubscribeMatches = onSnapshot(matchesQuery, (querySnapshot) => {
      const matchesData: Match[] = []
      querySnapshot.forEach((doc) => {
        matchesData.push({ id: doc.id, ...doc.data() } as Match)
      })
      setMatches(matchesData)
    })

    return () => {
      unsubscribePlayers()
      unsubscribeMatches()
    }
  }, [])

  return (
    <PlayersContext.Provider value={players}>
      <MatchesContext.Provider value={matches}>
        {children}
      </MatchesContext.Provider>
    </PlayersContext.Provider>
  )
}

export function usePlayers() {
  return useContext(PlayersContext)
}

export function useMatches() {
  return useContext(MatchesContext)
}
