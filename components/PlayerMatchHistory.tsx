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

export function PlayerMatchHistory() {
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
      orderBy("date", "desc"),
      limit(50)
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

  useEffect(() => {
    if (matches.length > 0 && players.length > 0) {
      const sortedPlayers = [...players].sort((a, b) => {
        const aMatches = matches.filter(match =>
          match.players.some(player => player.id === a.id)
        ).length
        const bMatches = matches.filter(match =>
          match.players.some(player => player.id === b.id)
        ).length
        return bMatches - aMatches
      })
      setPlayers(sortedPlayers)
    }
  }, [matches, players])

  const getPlayerMatchHistory = (playerId: string) => {
    const playerMatches = matches.filter((match) =>
      match.players.some((player) => player.id === playerId)
    )

    return playerMatches.map((match) => {
      const player = match.players.find((p) => p.id === playerId)
      const isWinner =
        (match.winner === "Liberal" && player?.role === "Liberal") ||
        (match.winner === "Faşist" && (player?.role === "Faşist" || player?.role === "Hitler"))
      return isWinner
    })
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">Oyuncu Maç Geçmişi</CardTitle>
          <img src="/playerHistory.png" alt="History Logo" className="w-7 h-7 opacity-55" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İsim</TableHead>
              <TableHead>Maçlar (Yeniden Eskiye)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell className="text-center align-middle">
                  <div className="flex items-center flex-wrap">
                    {getPlayerMatchHistory(player.id).slice(0, 24).map((isWinner, index) => {
                      const bgColor = isWinner ? "bg-green-600" : "bg-red-500"

                      return (
                        <span
                          key={index}
                          className={`w-10 h-8 flex items-center justify-center ${bgColor} text-white rounded-full text-sm font-semibold tracking-wider mr-2 mt-1 mb-1`}>
                          {isWinner ? "W" : "L"}
                        </span>
                      )
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}