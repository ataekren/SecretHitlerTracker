"use client"

import type React from "react"
import { useState } from "react"
import { addDoc, collection, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { usePlayers } from "@/lib/firebase-context"
import { Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

export function AddPlayerForm() {
  const players = usePlayers()
  const [name, setName] = useState("")
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      const trimmedName = name.trim()

      // Check for uniqueness
      if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast({
          title: "Hata!",
          description: "Bu isimde bir oyuncu zaten sistemde mevcut! Lütfen farklı bir isim girin.",
          variant: "destructive",
        })
        return
      }

      try {
        await addDoc(collection(db, "players"), {
          name: trimmedName,
          wins: 0,
          totalGames: 0,
          elo: 1000,
          liberalGames: 0,
          liberalWins: 0,
          fascistGames: 0,
          fascistWins: 0,
          hitlerGames: 0,
          hitlerWins: 0,
          penaltyCount: 0,
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

  const startEditing = (player: { id: string; name: string }) => {
    setEditingPlayerId(player.id)
    setEditName(player.name)
  }

  const cancelEditing = () => {
    setEditingPlayerId(null)
    setEditName("")
  }

  const handleEditSubmit = async (playerId: string) => {
    const trimmedEditName = editName.trim()
    const currentPlayer = players.find(p => p.id === playerId)

    if (trimmedEditName && currentPlayer && trimmedEditName !== currentPlayer.name) {
      // Check for uniqueness
      if (players.some(p => p.id !== playerId && p.name.toLowerCase() === trimmedEditName.toLowerCase())) {
        toast({
          title: "Hata",
          description: "Bu isimde bir oyuncu zaten sistemde mevcut! Lütfen farklı bir isim girin.",
          variant: "destructive",
        })
        return
      }

      try {
        await updateDoc(doc(db, "players", playerId), {
          name: trimmedEditName,
        })
        setEditingPlayerId(null)
        setEditName("")
        toast({
          title: "Başarılı",
          description: "Oyuncu adı güncellendi!",
        })
      } catch (error) {
        console.error("Oyuncu güncellenirken hata oluştu:", error)
        toast({
          title: "Hata",
          description: "Oyuncu güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } else {
      cancelEditing()
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
                <TableHead className="w-[40%] min-w-[200px]">İsim</TableHead>
                <TableHead>Toplam Oyun</TableHead>
                <TableHead>Kazanma</TableHead>
                <TableHead className="w-[100px]">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    {editingPlayerId === player.id ? (
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 w-full"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSubmit(player.id)
                          if (e.key === "Escape") cancelEditing()
                        }}
                      />
                    ) : (
                      player.name
                    )}
                  </TableCell>
                  <TableCell>{player.totalGames}</TableCell>
                  <TableCell>{player.wins}</TableCell>
                  <TableCell>
                    {editingPlayerId === player.id ? (
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSubmit(player.id)} className="h-8 w-8 text-green-600">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEditing} className="h-8 w-8 text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => startEditing(player)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
