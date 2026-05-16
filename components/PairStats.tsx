"use client"

import { useMemo } from "react"
import { usePlayers, useMatches } from "@/lib/firebase-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PairStatsProps {
  type: "win" | "lose"
}

export function PairStats({ type }: PairStatsProps) {
  const players = usePlayers()
  const matches = useMatches()

  const pairs = useMemo(() => {
    const pairMap = new Map<string, { names: [string, string]; count: number; totalGames: number }>()

    // First pass: count total games on the same team for all pairs
    const totalGamesMap = new Map<string, number>()
    for (const match of matches) {
      const winners: string[] = []
      const losers: string[] = []

      for (const player of match.players) {
        const isWinner =
          (match.winner === "Liberal" && player.role === "Liberal") ||
          (match.winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))
        if (isWinner) {
          winners.push(player.id)
        } else {
          losers.push(player.id)
        }
      }

      // Count pairs within each team
      for (const team of [winners, losers]) {
        for (let i = 0; i < team.length; i++) {
          for (let j = i + 1; j < team.length; j++) {
            const key = [team[i], team[j]].sort().join("_")
            totalGamesMap.set(key, (totalGamesMap.get(key) || 0) + 1)
          }
        }
      }
    }

    // Second pass: count win/lose pairs
    for (const match of matches) {
      const winners: string[] = []
      const losers: string[] = []

      for (const player of match.players) {
        const isWinner =
          (match.winner === "Liberal" && player.role === "Liberal") ||
          (match.winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))

        if (isWinner) {
          winners.push(player.id)
        } else {
          losers.push(player.id)
        }
      }

      const group = type === "win" ? winners : losers

      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const key = [group[i], group[j]].sort().join("_")

          const existing = pairMap.get(key)
          if (existing) {
            existing.count++
          } else {
            const nameA = players.find(p => p.id === group[i])?.name || group[i]
            const nameB = players.find(p => p.id === group[j])?.name || group[j]
            pairMap.set(key, { names: [nameA, nameB], count: 1, totalGames: totalGamesMap.get(key) || 0 })
          }
        }
      }
    }

    // Sort by count descending and take top 6
    return Array.from(pairMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [players, matches, type])

  const isWin = type === "win"

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">
            {isWin ? "En Çok Beraber Kazananlar" : "En Çok Beraber Kaybedenler"}
          </CardTitle>
          <img src={isWin ? "/success.png" : "/failed.png"} alt={isWin ? "Success" : "Failed"} className="w-7 h-7 opacity-55" />
        </div>
      </CardHeader>
      <CardContent>
        <Table className="text-[14px]">
          <TableHeader>
            <TableRow>
              <TableHead>Sıra</TableHead>
              <TableHead>İkili</TableHead>
              <TableHead className="text-center">Toplam</TableHead>
              <TableHead className="text-center">{isWin ? "Kazanma" : "Kaybetme"}</TableHead>
              <TableHead className="text-center">Oran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pairs.map((pair, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {pair.names[0]}
                  <span className="text-muted-foreground mx-1">-</span>
                  {pair.names[1]}
                </TableCell>
                <TableCell className="text-center">{pair.totalGames}</TableCell>
                <TableCell className="text-center">{pair.count}</TableCell>
                <TableCell className="text-center">
                  %{pair.totalGames > 0 ? ((pair.count / pair.totalGames) * 100).toFixed(0) : 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
