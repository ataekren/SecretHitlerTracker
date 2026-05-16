"use client"

import { useMemo } from "react"
import { usePlayers, useMatches } from "@/lib/firebase-context"
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

function getPlayerStreak(playerId: string, matches: { winner: string; players: { id: string; role: string }[] }[]): { type: "win" | "lose"; count: number } | null {
  // Matches are already sorted by date desc (newest first)
  const playerMatches = matches.filter(match =>
    match.players.some(p => p.id === playerId)
  )

  if (playerMatches.length === 0) return null

  let streakType: "win" | "lose" | null = null
  let count = 0

  for (const match of playerMatches) {
    const player = match.players.find(p => p.id === playerId)
    if (!player) break

    const isWinner =
      (match.winner === "Liberal" && player.role === "Liberal") ||
      (match.winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))

    const currentResult = isWinner ? "win" : "lose"

    if (streakType === null) {
      streakType = currentResult
      count = 1
    } else if (currentResult === streakType) {
      count++
    } else {
      break
    }
  }

  if (count >= 3 && streakType) {
    return { type: streakType, count }
  }

  return null
}

export function Leaderboard() {
  const players = usePlayers()
  const matches = useMatches()

  const streaks = useMemo(() => {
    const map = new Map<string, { type: "win" | "lose"; count: number }>()
    for (const player of players) {
      const streak = getPlayerStreak(player.id, matches)
      if (streak) {
        map.set(player.id, streak)
      }
    }
    return map
  }, [players, matches])

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
            {players.map((player, index) => {
              const streak = streaks.get(player.id)
              return (
                <TableRow key={player.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {player.name}
                      {streak && (
                        <span className="relative group">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold cursor-default ${streak.type === "win"
                              ? "bg-gray-200 text-orange-500"
                              : "bg-gray-200 text-blue-500"
                              }`}
                          >
                            {streak.type === "win" ? "🔥" : "❄️"}{streak.count}{"\u2009"}
                          </span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-200 text-foreground text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                            <span className="font-bold">{player.name}</span> son {streak.count} maçını {streak.type === "win" ? "kazandı!" : "kaybetti!"}
                          </span>
                        </span>
                      )}
                    </div>
                  </TableCell>
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
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}