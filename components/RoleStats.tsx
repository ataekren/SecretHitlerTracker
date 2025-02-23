"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Player {
  id: string
  name: string
  liberalGames: number
  liberalWins: number
  fascistGames: number
  fascistWins: number
  hitlerGames: number
  hitlerWins: number
}

export function RoleStats() {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const q = query(collection(db, "players"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player)
      })
      setPlayers(playersData)
    })

    return () => unsubscribe()
  }, [])

  const getLiberalPlayers = () => {
    return players
      .filter(player => player.liberalGames > 0)
      .sort((a, b) => (b.liberalWins / b.liberalGames) - (a.liberalWins / a.liberalGames))
  }

  const getFascistPlayers = () => {
    return players
      .filter(player => player.fascistGames > 0)
      .sort((a, b) => (b.fascistWins / b.fascistGames) - (a.fascistWins / a.fascistGames))
  }

  const getHitlerPlayers = () => {
    return players
      .filter(player => player.hitlerGames > 0)
      .sort((a, b) => (b.hitlerWins / b.hitlerGames) - (a.hitlerWins / a.hitlerGames))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {/* Liberal Stats */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-500">Liberal İstatistikleri</CardTitle>
            <img src="/liberal.png" alt="Liberal Logo" className="w-8 h-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Oyun</TableHead>
                <TableHead>Kazanılan</TableHead>
                <TableHead>Oran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getLiberalPlayers().map((player) => (
                <TableRow key={`liberal-${player.id}`}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.liberalGames}</TableCell>
                  <TableCell>{player.liberalWins}</TableCell>
                  <TableCell>
                    {((player.liberalWins / player.liberalGames) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fascist Stats */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-500">Faşist İstatistikleri</CardTitle>
            <img src="/fasist.png" alt="Fascist Logo" className="w-8 h-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Oyun</TableHead>
                <TableHead>Kazanılan</TableHead>
                <TableHead>Oran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFascistPlayers().map((player) => (
                <TableRow key={`fascist-${player.id}`}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.fascistGames}</TableCell>
                  <TableCell>{player.fascistWins}</TableCell>
                  <TableCell>
                    {((player.fascistWins / player.fascistGames) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hitler Stats */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-700">Hitler İstatistikleri</CardTitle>
            <img src="/hitler.png" alt="Hitler Logo" className="w-8 h-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Oyun</TableHead>
                <TableHead>Kazanılan</TableHead>
                <TableHead>Oran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getHitlerPlayers().map((player) => (
                <TableRow key={`hitler-${player.id}`}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.hitlerGames}</TableCell>
                  <TableCell>{player.hitlerWins}</TableCell>
                  <TableCell>
                    {((player.hitlerWins / player.hitlerGames) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}