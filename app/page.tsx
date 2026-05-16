import { Navbar } from "@/components/Navbar"
import { MatchList } from "@/components/MatchList"
import { Leaderboard } from "@/components/Leaderboard"
import { RoleStats } from "@/components/RoleStats"
import { WinnerRolesStats } from "@/components/WinnerRolesStats"
import { PairStats } from "@/components/PairStats"
import Image from "next/image"
import { PlayerMatchHistory } from "@/components/PlayerMatchHistory"
import { ChangelogModal } from "@/components/ChangelogModal"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ChangelogModal />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WinnerRolesStats />
          <PairStats type="win" />
          <PairStats type="lose" />
        </div>
        <MatchList />
        <PlayerMatchHistory />
        </main>
    </div>
  )
}

