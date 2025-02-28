"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle } from "lucide-react"

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
    penaltyCount: number
  }

interface Match {
id: string
date: string
winner: "Liberal" | "Faşist"
players: {
    id: string
    name: string
    role: "Liberal" | "Faşist" | "Hitler"
}[]
}

interface MatchPlayer {
  id: string
  name: string
  role: string
}

interface Inconsistency {
  player: string
  field: string
  stored: number
  calculated: number
}

export function DataConsistencyChecker() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const playersQuery = query(collection(db, "players"))
    const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player)
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

  const findInconsistencies = () => {
    const inconsistencies: Inconsistency[] = []

    for (const player of players) {
      // Calculate stats from matches
      const matchStats = {
        // Total stats
        totalMatches: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id)
        ).length,
        
        totalWins: matches.filter(match => {
          const playerRole = match.players.find((p: MatchPlayer) => p.id === player.id)?.role
          return (match.winner === "Liberal" && playerRole === "Liberal") ||
                 (match.winner === "Faşist" && (playerRole === "Faşist" || playerRole === "Hitler"))
        }).length,

        // Liberal stats
        liberalMatches: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id && p.role === "Liberal")
        ).length,
        
        liberalWins: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id && p.role === "Liberal") && 
          match.winner === "Liberal"
        ).length,

        // Fascist stats
        fascistMatches: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id && p.role === "Faşist")
        ).length,
        
        fascistWins: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id && p.role === "Faşist") && 
          match.winner === "Faşist"
        ).length,

        // Hitler stats
        hitlerMatches: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id && p.role === "Hitler")
        ).length,
        
        hitlerWins: matches.filter(match => 
          match.players.some((p: MatchPlayer) => p.id === player.id && p.role === "Hitler") && 
          match.winner === "Faşist"
        ).length,

        calculatedElo: matches
        .filter(match => match.players.some(p => p.id === player.id))
        .reduce((elo, match) => {
          const playerRole = match.players.find(p => p.id === player.id)?.role
          const isWinner = 
            (match.winner === "Liberal" && playerRole === "Liberal") ||
            (match.winner === "Faşist" && (playerRole === "Faşist" || playerRole === "Hitler"))
          
          return elo + (isWinner ? 10 : -10)
        }, 1000 - (player.penaltyCount * 5))
      }

      // Compare with stored player data
      if (matchStats.totalMatches !== player.totalGames) {
        inconsistencies.push({
          player: player.name,
          field: "Toplam Maç Sayısı",
          stored: player.totalGames,
          calculated: matchStats.totalMatches
        })
      }

      if (matchStats.totalWins !== player.wins) {
        inconsistencies.push({
          player: player.name,
          field: "Toplam Kazanma Sayısı",
          stored: player.wins,
          calculated: matchStats.totalWins
        })
      }

      if (matchStats.liberalMatches !== player.liberalGames) {
        inconsistencies.push({
          player: player.name,
          field: "Liberal Maç Sayısı",
          stored: player.liberalGames,
          calculated: matchStats.liberalMatches
        })
      }

      if (matchStats.liberalWins !== player.liberalWins) {
        inconsistencies.push({
          player: player.name,
          field: "Liberal Kazanma",
          stored: player.liberalWins,
          calculated: matchStats.liberalWins
        })
      }

      if (matchStats.fascistMatches !== player.fascistGames) {
        inconsistencies.push({
          player: player.name,
          field: "Faşist Maç Sayısı",
          stored: player.fascistGames,
          calculated: matchStats.fascistMatches
        })
      }

      if (matchStats.fascistWins !== player.fascistWins) {
        inconsistencies.push({
          player: player.name,
          field: "Faşist Kazanma",
          stored: player.fascistWins,
          calculated: matchStats.fascistWins
        })
      }

      if (matchStats.hitlerMatches !== player.hitlerGames) {
        inconsistencies.push({
          player: player.name,
          field: "Hitler Maç",
          stored: player.hitlerGames,
          calculated: matchStats.hitlerMatches
        })
      }

      if (matchStats.hitlerWins !== player.hitlerWins) {
        inconsistencies.push({
          player: player.name,
          field: "Hitler Kazanma",
          stored: player.hitlerWins,
          calculated: matchStats.hitlerWins
        })
      }

      if (matchStats.calculatedElo !== player.elo) {
        inconsistencies.push({
          player: player.name,
          field: "ELO Puanı",
          stored: player.elo,
          calculated: matchStats.calculatedElo
        })
      }
    }

    return inconsistencies
  }

  const inconsistencies = findInconsistencies()

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">Veri Tutarlılık Kontrolü</CardTitle>
          <img src="/check.png" alt="Check Logo" className="w-8 h-8 opacity-55" />
        </div>
      </CardHeader>
      <CardContent>
        {inconsistencies.length === 0 ? (
          <Alert className="mb-2 mt-3 bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <AlertTitle className="ml-2">Tutarlı</AlertTitle>
            <AlertDescription className="ml-2">
              Oyuncu istatistikleri ve maç kayıtları arasında tutarsızlık bulunmamaktadır.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="mb-2 mt-3 bg-yellow-500/10 border-yellow-500/20">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <AlertTitle className="ml-2">Tutarsızlık Tespit Edildi</AlertTitle>
              <AlertDescription className="ml-2">
                Aşağıdaki verilerde tutarsızlık bulunmaktadır.
              </AlertDescription>
            </Alert>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oyuncu</TableHead>
                  <TableHead>Veri</TableHead>
                  <TableHead className="text-center">Kayıtlı Veri</TableHead>
                  <TableHead className="text-center">Hesaplanan Veri</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inconsistencies.map((inc, index) => (
                  <TableRow key={index}>
                    <TableCell>{inc.player}</TableCell>
                    <TableCell>{inc.field}</TableCell>
                    <TableCell className="text-center">{inc.stored}</TableCell>
                    <TableCell className="text-center">{inc.calculated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  )
}