import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KIM | Secret Hitler Match Tracker",
  description: "A web-based platform to track Secret Hitler match results, player roles, and win statistics. Easily record and analyze game history for a better gaming experience.",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <footer className="bg-primary text-muted-foreground py-4 mt-8">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Keep in Mind | Secret Hitler Match Tracker</p>
            <div className="flex space-x-4">
              <Link href="https://github.com/ataekren/SecretHitlerTracker" target="_blank" rel="noopener noreferrer">
                <img src="/github.png" alt="GitHub" className="w-6 h-6 opacity-25 hover:opacity-70 transition-opacity duration-300" />
              </Link>
              <Link href="https://discord.gg/RDpF87e89P" target="_blank" rel="noopener noreferrer">
                <img src="/discord.png" alt="Discord" className="w-8 h-6 opacity-25 hover:opacity-70 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

