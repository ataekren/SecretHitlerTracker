"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { addDoc, collection, getDocs, updateDoc, doc, increment, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface Player {
  id: string
  name: string
}

export function AddMatchForm() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<{id: string, role: string}[]>([])
  const [winner, setWinner] = useState("")
  const [penaltyPlayer, setPenaltyPlayer] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "players"))
      const playersData: Player[] = []
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, name: doc.data().name })
      })
      setPlayers(playersData)
    }
    fetchPlayers()
  }, [])

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === playerId)
      if (isSelected) {
        return prev.filter(p => p.id !== playerId)
      } else {
        return [...prev, { id: playerId, role: "Liberal" }]
      }
    })
  }

  const handleRoleChange = (playerId: string, role: string) => {
    setSelectedPlayers(prev =>
      prev.map(p => p.id === playerId ? { ...p, role } : p)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPlayers.length > 0 && selectedPlayers.every(p => p.role) && winner) {
      try {
        const matchData = {
          date: new Date().toISOString(),
          winner,
          players: selectedPlayers.map(({ id, role }) => ({
            id,
            name: players.find((p) => p.id === id)?.name,
            role,
          })),
        }

        await addDoc(collection(db, "matches"), matchData)

        // Update player statistics
        for (const player of selectedPlayers) {
          const playerRef = doc(db, "players", player.id)
          const isWinner = 
            (winner === "Liberal" && player.role === "Liberal") || 
            (winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))

          const updates: any = {
            totalGames: increment(1),
            wins: isWinner ? increment(1) : increment(0),
            elo: increment(isWinner ? 10 : -10),
          }

          // Update role-specific statistics
          switch (player.role) {
            case "Liberal":
              updates.liberalGames = increment(1)
              if (winner === "Liberal") {
                updates.liberalWins = increment(1)
              }
              break
            case "Faşist":
              updates.fascistGames = increment(1)
              if (winner === "Faşist") {
                updates.fascistWins = increment(1)
              }
              break
            case "Hitler":
              updates.hitlerGames = increment(1)
              if (winner === "Faşist") {
                updates.hitlerWins = increment(1)
              }
              break
          }

          await updateDoc(playerRef, updates)
        }

        setSelectedPlayers([])
        setWinner("")
        toast({
          title: "Başarılı",
          description: "Maç sonucu başarıyla eklendi!",
        })
      } catch (error) {
        console.error("Maç sonucu eklenirken hata oluştu:", error)
        toast({
          title: "Hata",
          description: "Maç sonucu eklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
  }

  const selectPlayersFromLastMatch = async () => {
    try {
      const q = query(collection(db, "matches"), orderBy("date", "desc"), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const lastMatch = querySnapshot.docs[0].data()
        const lastMatchPlayers = lastMatch.players.map((p: any) => ({
          id: p.id,
          role: "Liberal"
        }))
        setSelectedPlayers(lastMatchPlayers)
      } else {
        toast({
          title: "Bilgi",
          description: "Henüz hiç maç eklenmemiş.",
        })
      }
    } catch (error) {
      console.error("Son maç bilgileri alınırken hata oluştu:", error)
      toast({
        title: "Hata",
        description: "Son maç bilgileri alınırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handlePenalty = async () => {
    if (!penaltyPlayer) {
      toast({ title: "Hata", description: "Lütfen bir oyuncu seçin.", variant: "destructive" })
      return
    }

    try {
      const playerRef = doc(db, "players", penaltyPlayer)
      await updateDoc(playerRef, { 
        elo: increment(-5),
        penaltyCount: increment(1)
       })

      toast({
        title: "Ceza Verildi",
        description: "Oyuncunun ELO'su 5 azaltıldı.",
      })
    } catch (error) {
      console.error("Ceza verme hatası:", error)
      toast({ title: "Hata", description: "Ceza uygulanırken bir hata oluştu.", variant: "destructive" })
    } finally {
      setPenaltyPlayer(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Maç Sonucu Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-5 mb-3">
              <label>Oyuncular ve Rolleri</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectPlayersFromLastMatch}
              >
                Son Maçtakileri Seç
              </Button>
            </div>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center">
                  <div className="flex items-center w-[150px]">
                    <Checkbox
                      id={`player-${player.id}`}
                      checked={selectedPlayers.some(p => p.id === player.id)}
                      onCheckedChange={() => handlePlayerSelect(player.id)}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`player-${player.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {player.name}
                    </label>
                  </div>
                  
                  <div className="w-[200px]">
                    {selectedPlayers.some(p => p.id === player.id) ? (
                      <div className="flex gap-0.5">
                        <Button
                          type="button"
                          size="sm"
                          variant={selectedPlayers.find(p => p.id === player.id)?.role === "Liberal" ? "default" : "outline"}
                          onClick={() => handleRoleChange(player.id, "Liberal")}
                          className={`min-w-[60px] px-1 ${
                            selectedPlayers.find(p => p.id === player.id)?.role === "Liberal" 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : ""
                          }`}
                        >
                          Liberal
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={selectedPlayers.find(p => p.id === player.id)?.role === "Faşist" ? "default" : "outline"}
                          onClick={() => handleRoleChange(player.id, "Faşist")}
                          className={`min-w-[60px] px-1 ${
                            selectedPlayers.find(p => p.id === player.id)?.role === "Faşist" 
                            ? "bg-red-500 hover:bg-red-600 text-white" 
                            : ""
                          }`}
                        >
                          Faşist
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={selectedPlayers.find(p => p.id === player.id)?.role === "Hitler" ? "default" : "outline"}
                          onClick={() => handleRoleChange(player.id, "Hitler")}
                          className={`min-w-[60px] px-1 ${
                            selectedPlayers.find(p => p.id === player.id)?.role === "Hitler" 
                            ? "bg-red-700 hover:bg-red-800 text-white" 
                            : ""
                          }`}
                        >
                          Hitler
                        </Button>
                      </div>
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="winner" className="block mb-2">
              Kazanan Rol
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={winner === "Liberal" ? "default" : "outline"}
                onClick={() => setWinner("Liberal")}
                className={`flex-1 ${winner === "Liberal" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
              >
                Liberal
              </Button>
              <Button
                type="button"
                variant={winner === "Faşist" ? "default" : "outline"}
                onClick={() => setWinner("Faşist")}
                className={`flex-1 ${winner === "Faşist" ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
              >
                Faşist
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={!selectedPlayers.length || !selectedPlayers.every(p => p.role) || !winner}
            className="w-full"
          >
            Maç Sonucu Ekle
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="border-t pt-4 w-full">
          <h3 className="text-sg font-semibold mb-2">Oyuncuya Ceza Ver</h3>
          <div className="flex gap-2 items-center">
            <select
              value={penaltyPlayer || ""}
              onChange={(e) => setPenaltyPlayer(e.target.value)}
              className="border p-2 rounded w-full text-sm"
            >
              <option value="">Oyuncu Seç</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            <Button 
            size="sm"
            onClick={handlePenalty} 
            disabled={!penaltyPlayer}
          >Ceza Ver</Button>
          </div>
        </div>
      </CardFooter>

    </Card>
  )
}
