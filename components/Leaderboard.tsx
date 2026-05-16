"use client"

import { usePlayers } from "@/lib/firebase-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Germania_One } from 'next/font/google'
import { Pirata_One } from "next/font/google"


const germaniaOne = Germania_One({
  subsets: ["latin"],
  weight: '400',
})

const pirataOne = Pirata_One({
  subsets: ["latin"],
  weight: '400',
})

export function Leaderboard() {
  const players = usePlayers()

  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <CardTitle className={`text-[36px] tracking-wide text-muted-foreground ${germaniaOne.className}`}>LEADERBOARD</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sıra</TableHead>
              <TableHead>İsim</TableHead>
              <TableHead className="text-center">Toplam Oyun</TableHead>
              <TableHead className="text-center">Kazanılan Oyun</TableHead>
              <TableHead className="text-center">Kaybedilen Oyun</TableHead>
              <TableHead className="text-center">Kazanma Oranı</TableHead>
              <TableHead className="text-center">Ceza</TableHead>
              <TableHead className="text-center">ELO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell className="text-center">{player.totalGames}</TableCell>
                <TableCell className="text-center">{player.wins}</TableCell>
                <TableCell className="text-center">{player.totalGames - player.wins}</TableCell>
                <TableCell className="text-center">
                  {player.totalGames > 0
                    ? `%${((player.wins / player.totalGames) * 100).toFixed(1)}`
                    : "%0"}
                </TableCell>
                <TableCell className="text-center">{player.penaltyCount}</TableCell>
                <TableCell className="text-center">{player.elo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}