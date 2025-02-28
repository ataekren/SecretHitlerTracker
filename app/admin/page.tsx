"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Navbar } from "@/components/Navbar"
import { AddPlayerForm } from "@/components/AddPlayerForm"
import { AddMatchForm } from "@/components/AddMatchForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayerMatchHistory } from "@/components/PlayerMatchHistory"
import { AdminPlayerMatchHistory } from "@/components/AdminPlayerMatchHistory"

export default function AdminPanel() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Yönetici Paneli</CardTitle>
            <CardDescription>Oyuncu ekleyin veya maç sonucu girin!</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add-player" className="space-y-4">
              <TabsList>
                <TabsTrigger value="add-player">Oyuncu Ekle</TabsTrigger>
                <TabsTrigger value="add-match">Maç Sonucu Ekle</TabsTrigger>
                <TabsTrigger value="matches">Maçlar</TabsTrigger>
              </TabsList>
              <TabsContent value="add-player">
                <AddPlayerForm />
              </TabsContent>
              <TabsContent value="add-match">
                <AddMatchForm />
              </TabsContent>
              <TabsContent value="matches">
                <AdminPlayerMatchHistory />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

