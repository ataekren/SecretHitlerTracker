"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Reset error state
    try {
      console.log("Attempting login with:", email) // Debug log
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login successful:", userCredential.user) // Debug log
      router.push("/admin")
    } catch (error) {
      console.error("Login error:", error) // Debug log
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yönetici Girişi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <Button type="submit" className="w-full mt-4">
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

