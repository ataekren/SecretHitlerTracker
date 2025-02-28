"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataConsistencyChecker } from "@/components/DataConsistencyChecker"


interface Player {
  id: string
  name: string
  penaltyCount: number
}

interface Match {
  id: string
  date: string
  winner: string
  elo: number
  players: { id: string; name: string; role: string }[]
}

export default function AdminStats() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const playersQuery = query(collection(db, "players"))
    const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, name: doc.data().name, penaltyCount: doc.data().penaltyCount })
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

    const playerData = players.find(p => p.id === playerId)
    const penaltyDeduction = (playerData?.penaltyCount || 0) * 5
    const elo = 1000 + (wins * 10) + (losses * (-10)) - penaltyDeduction

    return {
      totalMatches,
      wins,
      losses,
      elo
    }
  }

  const getLiberalStats = (playerId: string) => {
    const liberalMatches = matches.filter((match) =>
      match.players.some((player) => player.id === playerId && player.role === "Liberal")
    )

    const totalLiberalMatches = liberalMatches.length
    const liberalWins = liberalMatches.filter((match) => match.winner === "Liberal").length
    const liberalLosses = totalLiberalMatches - liberalWins

    return {
      totalLiberalMatches,
      liberalWins,
      liberalLosses
    }
  }

  const getFascistStats = (playerId: string) => {
    const fascistMatches = matches.filter((match) =>
      match.players.some((player) => player.id === playerId && player.role === "Faşist")
    )
  
    const totalFascistMatches = fascistMatches.length
    const fascistWins = fascistMatches.filter((match) => match.winner === "Faşist").length
    const fascistLosses = totalFascistMatches - fascistWins
  
    return {
      totalFascistMatches,
      fascistWins,
      fascistLosses
    }
  }
  
  const getHitlerStats = (playerId: string) => {
    const hitlerMatches = matches.filter((match) =>
      match.players.some((player) => player.id === playerId && player.role === "Hitler")
    )
  
    const totalHitlerMatches = hitlerMatches.length
    const hitlerWins = hitlerMatches.filter((match) => match.winner === "Faşist").length
    const hitlerLosses = totalHitlerMatches - hitlerWins
  
    return {
      totalHitlerMatches,
      hitlerWins,
      hitlerLosses
    }
  }

  return (
    <div className="space-y-8">
      <DataConsistencyChecker />
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
                <TableHead className="text-center">ELO</TableHead>
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
                    <TableCell className="text-center">{stats.elo}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-500">Liberal İstatistikleri</CardTitle>
              <img src="/liberal.png" alt="Liberal Stats Logo" className="w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead className="text-center">Maç</TableHead>
                  <TableHead className="text-center">Kazanma</TableHead>
                  <TableHead className="text-center">Kaybetme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => {
                  const stats = getLiberalStats(player.id)
                  return (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell className="text-center">{stats.totalLiberalMatches}</TableCell>
                      <TableCell className="text-center">{stats.liberalWins}</TableCell>
                      <TableCell className="text-center">{stats.liberalLosses}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-500">Faşist İstatistikleri</CardTitle>
              <img src="/fasist.png" alt="Fascist Stats Logo" className="w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead className="text-center">Maç</TableHead>
                  <TableHead className="text-center">Kazanma</TableHead>
                  <TableHead className="text-center">Kaybetme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => {
                  const stats = getFascistStats(player.id)
                  return (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell className="text-center">{stats.totalFascistMatches}</TableCell>
                      <TableCell className="text-center">{stats.fascistWins}</TableCell>
                      <TableCell className="text-center">{stats.fascistLosses}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-700">Hitler İstatistikleri</CardTitle>
              <img src="/hitler.png" alt="Hitler Stats Logo" className="w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead className="text-center">Maç</TableHead>
                  <TableHead className="text-center">Kazanma</TableHead>
                  <TableHead className="text-center">Kaybetme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => {
                  const stats = getHitlerStats(player.id)
                  return (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell className="text-center">{stats.totalHitlerMatches}</TableCell>
                      <TableCell className="text-center">{stats.hitlerWins}</TableCell>
                      <TableCell className="text-center">{stats.hitlerLosses}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}