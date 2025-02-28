"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 bg-[url('/bg-pattern.png')] bg-repeat">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 text-center space-y-8 backdrop-blur-sm bg-background/95 border-2">
          <div className="relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
              >
                <img 
                  src="/fasist.png" 
                  alt="Fascist Logo" 
                  className="w-32 h-32 opacity-80"
                />
              </motion.div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h1 className="text-7xl font-bold text-red-500">404</h1>
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Gizli Sayfa Bulunamadı
            </h2>
            <div className="border-t border-border my-6" />
            <p className="text-muted-foreground text-lg">
              Bu sayfaya erişim yetkiniz yok veya sayfa artık mevcut değil.
            </p>
            <p className="text-red-500/80 italic text-sm">
              "Belki de bu bir Liberal komplodur?"
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white px-8"
                size="lg"
              >
                Güvenli Bölgeye Dön
              </Button>
            </Link>
          </div>

          <div className="text-xs text-muted-foreground/60 pt-4">
            Faşist Parti bu sayfanın varlığını reddetmektedir.
          </div>
        </Card>
      </motion.div>
    </div>
  )
}