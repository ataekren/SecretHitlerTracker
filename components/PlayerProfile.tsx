"use client"

import { useMemo } from "react"
import { usePlayerProfile } from "@/lib/player-profile-context"
import { usePlayers, useMatches } from "@/lib/firebase-context"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function PlayerProfile() {
  const { selectedPlayerId, closeProfile } = usePlayerProfile()
  const players = usePlayers()
  const matches = useMatches()

  const player = useMemo(() => {
    if (!selectedPlayerId) return null
    return players.find(p => p.id === selectedPlayerId) || null
  }, [selectedPlayerId, players])

  const rank = useMemo(() => {
    if (!player) return 0
    return players.indexOf(player) + 1
  }, [player, players])

  // Calculate ELO history from matches (oldest to newest)
  const eloHistory = useMemo(() => {
    if (!player) return []

    const playerMatches = [...matches]
      .filter(m => m.players.some(p => p.id === player.id))
      .reverse() // oldest first

    let elo = 1000
    const history = [{ match: 0, elo: 1000, date: "" }]

    playerMatches.forEach((match, index) => {
      const playerRole = match.players.find(p => p.id === player.id)?.role
      const isWinner =
        (match.winner === "Liberal" && playerRole === "Liberal") ||
        (match.winner === "Faşist" && (playerRole === "Faşist" || playerRole === "Hitler"))

      elo += isWinner ? 10 : -10
      history.push({
        match: index + 1,
        elo,
        date: new Date(match.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
      })
    })

    // Apply penalty
    if (player.penaltyCount > 0) {
      history[history.length - 1].elo -= player.penaltyCount * 5
    }

    return history
  }, [player, matches])

  // Role distribution
  const roleStats = useMemo(() => {
    if (!player) return { liberal: { games: 0, wins: 0 }, fascist: { games: 0, wins: 0 }, hitler: { games: 0, wins: 0 } }
    return {
      liberal: { games: player.liberalGames, wins: player.liberalWins },
      fascist: { games: player.fascistGames, wins: player.fascistWins },
      hitler: { games: player.hitlerGames, wins: player.hitlerWins },
    }
  }, [player])

  // Current streak
  const streak = useMemo(() => {
    if (!player) return null

    const playerMatches = matches.filter(m => m.players.some(p => p.id === player.id))
    if (playerMatches.length === 0) return null

    let type: "win" | "lose" | null = null
    let count = 0

    for (const match of playerMatches) {
      const role = match.players.find(p => p.id === player.id)?.role
      const isWinner =
        (match.winner === "Liberal" && role === "Liberal") ||
        (match.winner === "Faşist" && (role === "Faşist" || role === "Hitler"))

      const result = isWinner ? "win" : "lose"
      if (type === null) { type = result; count = 1 }
      else if (result === type) { count++ }
      else break
    }

    return count >= 2 ? { type, count } : null
  }, [player, matches])

  // Best partner (most wins together)
  const bestPartner = useMemo(() => {
    if (!player) return null

    const partnerWins = new Map<string, number>()

    for (const match of matches) {
      const playerInMatch = match.players.find(p => p.id === player.id)
      if (!playerInMatch) continue

      const isWinner =
        (match.winner === "Liberal" && playerInMatch.role === "Liberal") ||
        (match.winner === "Faşist" && (playerInMatch.role === "Faşist" || playerInMatch.role === "Hitler"))

      if (!isWinner) continue

      // Find teammates who also won
      for (const teammate of match.players) {
        if (teammate.id === player.id) continue
        const teammateWon =
          (match.winner === "Liberal" && teammate.role === "Liberal") ||
          (match.winner === "Faşist" && (teammate.role === "Faşist" || teammate.role === "Hitler"))

        if (teammateWon) {
          partnerWins.set(teammate.id, (partnerWins.get(teammate.id) || 0) + 1)
        }
      }
    }

    if (partnerWins.size === 0) return null

    let bestId = ""
    let bestCount = 0
    partnerWins.forEach((count, id) => {
      if (count > bestCount) { bestId = id; bestCount = count }
    })

    const bestPlayer = players.find(p => p.id === bestId)
    return bestPlayer ? { name: bestPlayer.name, count: bestCount } : null
  }, [player, players, matches])

  // Recent match results
  const recentMatches = useMemo(() => {
    if (!player) return []

    return matches
      .filter(m => m.players.some(p => p.id === player.id))
      .slice(0, 12)
      .map(match => {
        const role = match.players.find(p => p.id === player.id)?.role
        return (match.winner === "Liberal" && role === "Liberal") ||
          (match.winner === "Faşist" && (role === "Faşist" || role === "Hitler"))
      })
  }, [player, matches])

  if (!player) return null

  const winRate = player.totalGames > 0 ? ((player.wins / player.totalGames) * 100).toFixed(1) : "0"

  const RoleBar = ({ label, games, wins, color, textColor }: { label: string; games: number; wins: number; color: string; textColor: string }) => {
    const rate = games > 0 ? ((wins / games) * 100) : 0
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${textColor}`}>{label}</span>
          <div className="flex items-center">
            <span className="text-muted-foreground text-xs w-10 text-right whitespace-nowrap">{wins}/{games}</span>
            <span className="font-semibold text-foreground text-xs w-10 text-right whitespace-nowrap">%{(rate).toFixed(0)}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
          <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${rate}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeProfile}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <Card
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeProfile}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <CardContent className="pt-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{player.name}</h2>
                {streak && (
                  <span className="relative group">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold cursor-default bg-gray-200 ${streak.type === "win" ? "bg-gray-200 text-orange-500" : "bg-gray-200 text-blue-500"}`}>
                      {streak.type === "win" ? "🔥" : "❄️"}{streak.count}{"\u2009"}
                    </span>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-200 text-foreground text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                      <span className="font-bold">{player.name}</span> son {streak.count} maçını {streak.type === "win" ? "kazandı!" : "kaybetti!"}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">Sıralama: #{rank}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{player.elo}</div>
              <div className="text-xs text-muted-foreground">ELO</div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Toplam", value: player.totalGames },
              { label: "Galibiyet", value: player.wins },
              { label: "Mağlubiyet", value: player.totalGames - player.wins },
              { label: "Oran", value: `%${winRate}` },
              { label: "Ceza", value: player.penaltyCount },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Role Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Rol İstatistikleri</h3>
            <RoleBar label="Liberal" games={roleStats.liberal.games} wins={roleStats.liberal.wins} color="bg-blue-500" textColor="text-blue-500" />
            <RoleBar label="Faşist" games={roleStats.fascist.games} wins={roleStats.fascist.wins} color="bg-red-500" textColor="text-red-500" />
            <RoleBar label="Hitler" games={roleStats.hitler.games} wins={roleStats.hitler.wins} color="bg-red-700" textColor="text-red-700" />
          </div>

          {/* ELO Chart */}
          {eloHistory.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">ELO Geçmişi</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eloHistory}>
                    <XAxis dataKey="match" tick={{ fontSize: 11 }} />
                    <YAxis domain={["dataMin - 20", "dataMax + 20"]} tick={{ fontSize: 11 }} width={40} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="bg-white border rounded-lg px-3 py-2 shadow-md text-sm">
                              <div>Maç #{payload[0].payload.match}</div>
                              <div className="font-bold">ELO: {payload[0].value}</div>
                              {payload[0].payload.date && <div className="text-xs text-muted-foreground">{payload[0].payload.date}</div>}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type="natural" dataKey="elo" stroke="#4891ffff" strokeWidth={1.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Matches */}
          {recentMatches.length > 0 && (
            <div className="space-y-2" style={{ marginTop: eloHistory.length > 1 ? "12px" : undefined }}>
              <h3 className="text-sm font-semibold text-muted-foreground">Son Maçlar</h3>
              <div className="flex flex-wrap gap-1.5">
                {recentMatches.map((isWin, i) => (
                  <span
                    key={i}
                    className={`w-8 h-7 flex items-center justify-center rounded-full text-xs font-bold text-white ${isWin ? "bg-green-600" : "bg-red-500"
                      }`}
                  >
                    {isWin ? "W" : "L"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Best Partner */}
          {bestPartner && (
            <div className="bg-gray-100  rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">En İyi Partner</div>
                <div className="font-semibold">{bestPartner.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{bestPartner.count}</div>
                <div className="text-xs text-muted-foreground">birlikte galibiyet</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
