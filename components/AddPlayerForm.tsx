"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { addDoc, collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

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

export function AddPlayerForm() {
  const [name, setName] = useState("")
  const [players, setPlayers] = useState<Array<{ id: string; name: string; wins: number; totalGames: number }>>([])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "players"), (snapshot) => {
      const playersData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as { id: string; name: string; wins: number; totalGames: number },
      )
      setPlayers(playersData)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      try {
        await addDoc(collection(db, "players"), {
          name: name.trim(),
          wins: 0,
          totalGames: 0,
          elo: 1000,
          liberalGames: 0,
          liberalWins: 0,
          fascistGames: 0,
          fascistWins: 0,
          hitlerGames: 0,
          hitlerWins: 0,
        })
        setName("")
        toast({
          title: "Başarılı",
          description: "Oyuncu başarıyla eklendi!",
        })
      } catch (error) {
        console.error("Oyuncu eklenirken hata oluştu:", error)
        toast({
          title: "Hata",
          description: "Oyuncu eklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Oyuncu Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Oyuncu Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Button type="submit">Oyuncu Ekle</Button>
          </div>
        </form>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Oyuncu Listesi</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Kazanma</TableHead>
                <TableHead>Toplam Oyun</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.wins}</TableCell>
                  <TableCell>{player.totalGames}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

