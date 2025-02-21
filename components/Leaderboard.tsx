"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Player {
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
}

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const q = query(collection(db, "players"), orderBy("wins", "desc"), limit(10))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player)
      })
      setPlayers(playersData)
    })

    return () => unsubscribe()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liderlik Tablosu</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sıra</TableHead>
              <TableHead>İsim</TableHead>
              <TableHead>Toplam Oyun</TableHead>
              <TableHead>Kazanılan Oyun</TableHead>
              <TableHead>Kazanma Oranı</TableHead>
              <TableHead>ELO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.totalGames}</TableCell>
                <TableCell>{player.wins}</TableCell>
                <TableCell>
                  {player.totalGames > 0 
                    ? `${((player.wins / player.totalGames) * 100).toFixed(1)}%` 
                    : "0%"}
                </TableCell>
                <TableCell>{player.elo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

