"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  date: string
  winner: string
  players: { id: string; name: string; role: string }[]
}

export function AdminPlayerMatchHistory() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const playersQuery = query(collection(db, "players"))
    const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, name: doc.data().name })
      })
      setPlayers(playersData)
    })

    const matchesQuery = query(
      collection(db, "matches"),
      orderBy("date", "desc")
    )

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

  const getPlayerStats = (playerId: string) => {
    const playerMatches = matches.filter((match) =>
      match.players.some((player) => player.id === playerId)
    )

    const totalMatches = playerMatches.length
    const wins = playerMatches.filter((match) => {
      const player = match.players.find((p) => p.id === playerId)
      return (
        (match.winner === "Liberal" && player?.role === "Liberal") ||
        (match.winner === "Faşist" && (player?.role === "Faşist" || player?.role === "Hitler"))
      )
    }).length
    const losses = totalMatches - wins

    return {
      totalMatches,
      wins,
      losses
    }
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">Maç İstatistikleri</CardTitle>
          <img src="/stats.png" alt="Stats Logo" className="w-7 h-7 opacity-55" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İsim</TableHead>
              <TableHead className="text-center">Maç Sayısı</TableHead>
              <TableHead className="text-center">Kazanılan</TableHead>
              <TableHead className="text-center">Kaybedilen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              const stats = getPlayerStats(player.id)
              return (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="text-center">{stats.totalMatches}</TableCell>
                  <TableCell className="text-center">{stats.wins}</TableCell>
                  <TableCell className="text-center">{stats.losses}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}