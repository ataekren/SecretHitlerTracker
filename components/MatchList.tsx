"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Match {
  id: string
  date: string
  winner: string
  players: { name: string; role: string }[]
}

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const matchesPerPage = 15

  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set())

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

  const indexOfLastMatch = currentPage * matchesPerPage
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch)

  const totalPages = Math.ceil(matches.length / matchesPerPage)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const togglePlayers = (matchId: string) => {
    const newExpandedMatches = new Set(expandedMatches)
    if (newExpandedMatches.has(matchId)) {
      newExpandedMatches.delete(matchId)
    } else {
      newExpandedMatches.add(matchId)
    }
    setExpandedMatches(newExpandedMatches)
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">Son Maçlar</CardTitle>
          <img src="/history.png" alt="History Logo" className="w-7 h-7" />
        </div>
      </CardHeader>
      <CardContent className="card-content">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Kazanan Rol</TableHead>
              <TableHead>Oyuncular</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="whitespace-nowrap">
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
                  {match.players.slice(0, expandedMatches.has(match.id) ? match.players.length : 7).map((player) => {
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
                        className={`inline-block ${bgColor} text-white rounded-full px-3 py-1 text-s font-semibold mr-2 mb-1 mt-1 ${winnerStyle}`}
                      >
                        {player.name} ({player.role})
                      </span>
                    )
                  })}
                  
                  {match.players.length > 7 && (
                    <Button
                      variant="outline"
                      onClick={() => togglePlayers(match.id)} 
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-1 mt-1 text-gray-500 h-8 border-2 border-grey-500"
                      >
                      {expandedMatches.has(match.id) ? `Daralt` : `+${match.players.length - 7}`}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          {/* Sayfa seçim kısmı */}
          <div className="flex justify-center items-center flex-grow">
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

          {/* Toplam maç sayısı */}
          <span className="text-gray-600 text-s">
            Toplam Maç: {matches.length}
          </span>
        </div>
        
      </CardContent>
    </Card>
  )
}
