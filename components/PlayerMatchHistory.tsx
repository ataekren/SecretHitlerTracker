"use client"

import { useMemo } from "react"
import { usePlayers, useMatches } from "@/lib/firebase-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PlayerMatchHistory() {
  const contextPlayers = usePlayers()
  const matches = useMatches()

  // Sort players by match count (descending) - same logic as original
  const sortedPlayers = useMemo(() => {
    if (matches.length === 0 || contextPlayers.length === 0) return contextPlayers

    return [...contextPlayers].sort((a, b) => {
      const aMatches = matches.filter(match =>
        match.players.some(player => player.id === a.id)
      ).length
      const bMatches = matches.filter(match =>
        match.players.some(player => player.id === b.id)
      ).length
      return bMatches - aMatches
    })
  }, [contextPlayers, matches])

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
            {sortedPlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="max-w-[115px] sm:max-w-[115px] truncate font-medium" title={player.name}>
                  {player.name}
                </TableCell>
                <TableCell className="text-center align-middle">
                  <div className="flex items-center flex-wrap">
                    {(() => {
                      const history = getPlayerMatchHistory(player.id).slice(0, 24);
                      const emptyCount = Math.max(0, 24 - history.length);

                      return (
                        <>
                          {history.map((isWinner, index) => {
                            const bgColor = isWinner ? "bg-green-600" : "bg-red-500";

                            return (
                              <span
                                key={`match-${index}`}
                                className={`w-10 h-8 flex items-center justify-center ${bgColor} text-white rounded-full text-sm font-semibold tracking-wider mr-2 mt-1 mb-1`}>
                                {isWinner ? "W" : "L"}
                              </span>
                            );
                          })}
                          {Array.from({ length: emptyCount }).map((_, index) => (
                            <span
                              key={`empty-${index}`}
                              className="w-10 h-8 flex items-center justify-center bg-gray-400 opacity-50 text-white rounded-full text-sm font-semibold tracking-wider mr-2 mt-1 mb-1">
                              -
                            </span>
                          ))}
                        </>
                      );
                    })()}
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