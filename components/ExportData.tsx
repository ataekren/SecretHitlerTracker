import { useEffect, useState } from "react"
import { collection, query, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

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
  winner: string
  players: {
    id: string
    name: string
    role: string
  }[]
}

export function ExportData() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const playersSnapshot = await getDocs(collection(db, "players"))
      const playersData: Player[] = []
      playersSnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player)
      })
      setPlayers(playersData)

      const matchesQuery = query(collection(db, "matches"), orderBy("date", "desc"))
      const matchesSnapshot = await getDocs(matchesQuery)
      const matchesData: Match[] = []
      matchesSnapshot.forEach((doc) => {
        matchesData.push({ id: doc.id, ...doc.data() } as Match)
      })
      setMatches(matchesData)
    }
    fetchData()
  }, [])

  const exportToCSV = () => {
    // Leaderboard CSV
    const leaderboardHeaders = ["Isim", "Toplam Oyun", "Kazanilan", "Kaybedilen", "Ceza", "ELO"]
    const leaderboardRows = players.map(player => [
      player.name,
      player.totalGames,
      player.wins,
      player.totalGames - player.wins,
      player.penaltyCount,
      player.elo
    ])
    
    const leaderboardCSV = [
      leaderboardHeaders,
      ...leaderboardRows
    ].map(row => row.join(",")).join("\n")

    // Role Stats CSV
    const roleStatsHeaders = ["Isim", "Liberal Oyun", "Liberal Kazanma", "Faşist Oyun", "Faşist Kazanma", "Hitler Oyun", "Hitler Kazanma"]
    const roleStatsRows = players.map(player => [
      player.name,
      player.liberalGames,
      player.liberalWins,
      player.fascistGames,
      player.fascistWins,
      player.hitlerGames,
      player.hitlerWins,
    ])
    
    const roleStatsCSV = [
      roleStatsHeaders,
      ...roleStatsRows
    ].map(row => row.join(",")).join("\n")

    // Matches CSV
    const matchesHeaders = ["Tarih", "Kazanan", "Oyuncular"]
    const matchesRows = matches.map(match => [
      new Date(match.date).toLocaleString('tr-TR'),
      match.winner,
      match.players.map(p => `${p.name} (${p.role})`).join("; ")
    ])

    const matchesCSV = [
      matchesHeaders,
      ...matchesRows
    ].map(row => row.join(",")).join("\n")

    const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')
    
    // Download Leaderboard CSV
    const leaderboardBlob = new Blob([leaderboardCSV], { type: 'text/csv;charset=utf-8;' })
    const leaderboardLink = document.createElement("a")
    leaderboardLink.href = URL.createObjectURL(leaderboardBlob)
    leaderboardLink.download = `leaderboard_${date}.csv`
    leaderboardLink.click()

    // Download Role Stats CSV
    const roleStatsBlob = new Blob([roleStatsCSV], { type: 'text/csv;charset=utf-8;' })
    const roleStatsLink = document.createElement("a")
    roleStatsLink.href = URL.createObjectURL(roleStatsBlob)
    roleStatsLink.download = `role_stats_${date}.csv`
    roleStatsLink.click()

    // Download Matches CSV
    const matchesBlob = new Blob([matchesCSV], { type: 'text/csv;charset=utf-8;' })
    const matchesLink = document.createElement("a")
    matchesLink.href = URL.createObjectURL(matchesBlob)
    matchesLink.download = `matches_${date}.csv`
    matchesLink.click()
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle>Veri Yedekleme</CardTitle>
          <img src="/backup.png" alt="Backup Logo" className="w-7 h-7 opacity-55" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Mevcut liderlik tablosu, rol istatistikleri ve maç geçmişini CSV formatında dışa aktarın.
        </div>
        <Button 
          onClick={exportToCSV}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Verileri Dışa Aktar
        </Button>
      </CardContent>
    </Card>
  )
}