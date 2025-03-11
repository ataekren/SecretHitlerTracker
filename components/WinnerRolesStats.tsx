"use client"

import { useEffect, useState } from "react"
import { collection, query, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface Match {
  id: string
  date: string
  winner: string
  players: { name: string; role: string }[]
}

interface WinnerStats {
  name: string
  value: number
  color: string
}

export function WinnerRolesStats() {
  const [winnerStats, setWinnerStats] = useState<WinnerStats[]>([])
  const [totalMatches, setTotalMatches] = useState<number>(0)

  useEffect(() => {
    const q = query(collection(db, "matches"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const matches: Match[] = []
      querySnapshot.forEach((doc) => {
        matches.push({ id: doc.id, ...doc.data() } as Match)
      })
      
      const liberalWins = matches.filter(match => match.winner === "Liberal").length
      const fascistWins = matches.filter(match => match.winner === "Faşist").length
      
      setTotalMatches(matches.length)
      setWinnerStats([
        { name: "Liberal", value: liberalWins, color: "#3b82f6" },
        { name: "Faşist", value: fascistWins, color: "#ef4444" }
      ])
    })

    return () => unsubscribe()
  }, [])

  const calculatePercentage = (value: number): string => {
    if (totalMatches === 0) return "0%"
    return `${Math.round((value / totalMatches) * 100)}%`
  }

  // Tooltip
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{`Kazanılan Maç: ${payload[0].value}`}</p>
          <p className="text-sm">{`Kazanma Oranı: ${calculatePercentage(payload[0].value)}`}</p>
        </div>
      )
    }
    return null
  }

  // Custom legend içeriği
  const renderCustomLegend = (props: any) => {
    const { payload } = props

    return (
      <div className="flex justify-center mt-4 space-x-6">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">
              {entry.value}: {winnerStats[index].value} maç ({calculatePercentage(winnerStats[index].value)})
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground">Kazanan Rol Dağılımı</CardTitle>
          <img src="/stats.png" alt="Stats Logo" className="w-7 h-7 opacity-55" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {winnerStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winnerStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {winnerStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Veri yükleniyor...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}