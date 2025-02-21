"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Match {
  id: string
  date: string
  winner: string
  players: { name: string; role: string }[]
}

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("date", "desc"), limit(10))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const matchesData: Match[] = []
      querySnapshot.forEach((doc) => {
        matchesData.push({ id: doc.id, ...doc.data() } as Match)
      })
      setMatches(matchesData)
    })

    return () => unsubscribe()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Maçlar</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Kazanan</TableHead>
              <TableHead>Oyuncular</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
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
                        className={`inline-block ${bgColor} rounded-full px-2 py-1 text-xs font-semibold`}
                      >
                        {match.winner}
                      </span>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  {match.players.map((player) => {
                    let bgColor = ""
                    
                    // Rol rengini belirle
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

                    // Kazanan oyuncuları belirle
                    const isWinner = 
                      (match.winner === "Liberal" && player.role === "Liberal") || 
                      (match.winner === "Faşist" && (player.role === "Faşist" || player.role === "Hitler"))
                    
                    const winnerStyle = isWinner ? "border-2 border-green-400" : ""

                    return (
                      <span
                        key={player.name}
                        className={`inline-block ${bgColor} text-white rounded-full px-2 py-1 text-xs font-semibold mr-2 mb-2 ${winnerStyle}`}
                      >
                        {player.name} ({player.role})
                      </span>
                    )
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

