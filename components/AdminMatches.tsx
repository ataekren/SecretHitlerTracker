"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Match {
  id: string
  date: string
  winner: string
  players: { 
    id: string
    name: string 
    role: string 
  }[]
}

export function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)
  const [deletedMatchId, setDeletedMatchId] = useState<string | null>(null)
  const matchesPerPage = 15

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const matchesData: Match[] = []
      querySnapshot.forEach((doc) => {
        matchesData.push({ id: doc.id, ...doc.data() } as Match)
      })
      setMatches(matchesData)
    })

    return () => unsubscribe()
  }, [])

  const handleDeleteMatch = async (match: Match) => {
    try {
      setDeletedMatchId(match.id)

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300))

      // Delete match document
      await deleteDoc(doc(db, "matches", match.id))

      // Update player statistics
      for (const player of match.players) {
        const playerRef = doc(db, "players", player.id)
        const isWinner = 
          (match.winner === "Liberal" && player.role === "Liberal") ||
          (match.winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))

        const updates: any = {
          totalGames: increment(-1),
          wins: isWinner ? increment(-1) : increment(0),
          elo: increment(isWinner ? -10 : 10),
        }

        // Revert role-specific statistics
        switch (player.role) {
          case "Liberal":
            updates.liberalGames = increment(-1)
            if (match.winner === "Liberal") {
              updates.liberalWins = increment(-1)
            }
            break
          case "Faşist":
            updates.fascistGames = increment(-1)
            if (match.winner === "Faşist") {
              updates.fascistWins = increment(-1)
            }
            break
          case "Hitler":
            updates.hitlerGames = increment(-1)
            if (match.winner === "Faşist") {
              updates.hitlerWins = increment(-1)
            }
            break
        }

        await updateDoc(playerRef, updates)
      }

      toast({
        title: "Başarılı",
        description: "Maç başarıyla silindi.",
      })
    } catch (error) {
      console.error("Maç silinirken hata oluştu:", error)
      toast({
        title: "Hata",
        description: "Maç silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setMatchToDelete(null)
      setDeletedMatchId(null)
    }
  }

  const DeleteConfirmDialog = () => (
    <AlertDialog open={!!matchToDelete} onOpenChange={() => setMatchToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Maçı Silmeyi Onayla</AlertDialogTitle>
          <AlertDialogDescription>
            Bu maçı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p>Tarih: {matchToDelete && new Date(matchToDelete.date).toLocaleString('tr-TR')}</p>
              <p>Kazanan: {matchToDelete?.winner}</p>
              <p>Oyuncular: {matchToDelete?.players.map(p => `${p.name} (${p.role})`).join(', ')}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => matchToDelete && handleDeleteMatch(matchToDelete)}
          >
            Evet, Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  const indexOfLastMatch = currentPage * matchesPerPage
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch)
  const totalPages = Math.ceil(matches.length / matchesPerPage)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const scrollToTableBottom = () => {
    const cardContent = document.querySelector('.card-content')
    if (cardContent) {
      cardContent.scrollIntoView({ 
        behavior: 'auto', 
        block: 'end',
        inline: 'nearest' 
      })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const isLastPage = currentPage === totalPages
      const matchesInLastPage = matches.length % matchesPerPage
      const hasFewerMatches = isLastPage && matchesInLastPage > 0 && matchesInLastPage < matchesPerPage

      setCurrentPage(currentPage - 1)

      if (hasFewerMatches) {
        setTimeout(scrollToTableBottom, 10)
      }
    }
  }

  return (
    <Card>
      <DeleteConfirmDialog />
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">Maç Listesi</CardTitle>
          <Image src="/history.png" alt="History Logo" width={28} height={28} />
        </div>
      </CardHeader>
      <CardContent className="card-content">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Kazanan Rol</TableHead>
              <TableHead>Oyuncular</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {currentMatches.map((match) => (
                <motion.tr
                  key={match.id}
                  initial={{ opacity: 1, height: "auto" }}
                  animate={{
                    opacity: deletedMatchId === match.id ? 0 : 1,
                    height: deletedMatchId === match.id ? 0 : "auto"
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${match.id === deletedMatchId ? 'pointer-events-none' : ''}`}
                >
                  <TableCell>
                    {new Date(match.date).toLocaleString('tr-TR', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      let bgColor = ""
                      switch (match.winner) {
                        case "Liberal":
                          bgColor = "bg-blue-500 text-white"
                          break
                        case "Faşist":
                          bgColor = "bg-red-500 text-white"
                          break
                      }
                      return (
                        <span
                          className={`inline-block ${bgColor} rounded-full px-3 py-1 text-s font-semibold`}
                        >
                          {match.winner}
                        </span>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="align-middle">
                    {match.players.map((player) => {
                      let bgColor = ""
                      
                      switch (player.role) {
                        case "Liberal":
                          bgColor = "bg-blue-500"
                          break
                        case "Faşist":
                          bgColor = "bg-red-500"
                          break
                        case "Hitler":
                          bgColor = "bg-red-700"
                          break
                      }

                      const isWinner = 
                        (match.winner === "Liberal" && player.role === "Liberal") || 
                        (match.winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))
                      
                      const winnerStyle = isWinner ? "border-2 border-green-400" : ""

                      return (
                        <span
                          key={player.name}
                          className={`inline-block ${bgColor} text-white rounded-full px-2 py-1 text-xs font-semibold mr-2 mb-1 mt-1 ${winnerStyle}`}
                        >
                          {player.name} ({player.role})
                        </span>
                      )
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="default"
                      size="icon"
                      className="bg-black hover:bg-black/75"
                      onClick={() => setMatchToDelete(match)}
                      disabled={deletedMatchId === match.id}
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        <div className="flex justify-center items-center mt-4">
          <Button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            className="mr-2 text-xl"
          >
            ←
          </Button>
          <span className="mx-4">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="ml-2 text-xl"
          >
            →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}