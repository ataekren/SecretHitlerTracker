import { Navbar } from "@/components/Navbar"
import { MatchList } from "@/components/MatchList"
import { Leaderboard } from "@/components/Leaderboard"
import { RoleStats } from "@/components/RoleStats"
import Image from "next/image"
import { PlayerMatchHistory } from "@/components/PlayerMatchHistory"
import { DataConsistencyChecker } from "@/components/DataConsistencyChecker"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-4 space-y-8">
        <div className="flex justify-center mt-2 mb-6">
          <Image
            src="/hitler-logo.png"
            alt="Secret Hitler Logo"
            width={160}
            height={80}
            priority
          />
        </div>
        <Leaderboard />
        <RoleStats />
        <MatchList />
        <PlayerMatchHistory />
        </main>
    </div>
  )
}

