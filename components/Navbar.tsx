"use client"

import Link from "next/link"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { usePathname } from "next/navigation"
import Image from "next/image"

export function Navbar() {
  const [user] = useAuthState(auth)
  const pathname = usePathname()

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
          <Image
            src="/kim-logo.png"
            alt="Keep in Mind Logo"
            width={40}
            height={13}
            priority
          />
          <span className="text-lg font-medium">Keep in Mind</span>
        </Link>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="secondary" size="sm">Ana Sayfa</Button>
              </Link>
              <Link href="/admin">
                <Button variant="secondary" size="sm">Yönetici Paneli</Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut(auth)}
                className="text-foreground"
              >
                Çıkış Yap
              </Button>
            </div>
          ) : pathname === "/login" ? (
            <Link href="/">
              <Button variant="secondary" size="sm">Ana Sayfa</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm">Giriş Yap</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

