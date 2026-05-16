"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, BarChart3, Users, ShieldCheck } from "lucide-react"

const CHANGELOG_VERSION = "v1.1.6" // Change this to show the modal again in the future

export function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hasSeen = localStorage.getItem(`changelog_seen_${CHANGELOG_VERSION}`)
    if (!hasSeen) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(`changelog_seen_${CHANGELOG_VERSION}`, "true")
    setIsOpen(false)
  }

  // Prevent hydration mismatch by only rendering when mounted
  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <CardContent className="pt-8 pb-6 px-6 space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2">
              <img src="/hitler.png" alt="Hitler Left" className="w-8 h-8 object-contain" />
              <h2 className="text-2xl font-bold text-red-700">
                Neler Yeni?
              </h2>
              <img src="/hitler.png" alt="Hitler Right" className="w-8 h-8 object-contain" />
            </div>
            <p className="text-muted-foreground text-sm">
              Sistemi daha keyifli ve rekabetçi hale getirmek için bazı harika güncellemeler yaptık!
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Oyuncu Profilleri Eklendi</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Artık oyuncu isimlerine tıklayarak o oyuncuya ait özel profil ekranını açabilirsiniz.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Galibiyet ve Mağlubiyet Serileri</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Liderlik tablosu artık en formda oyuncuları takip ediyor. Üst üste en az 3 maç kazanan veya kaybeden oyuncular, isimlerinin yanındaki ateş ve buz ikonlarıyla anında fark edilecek.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">En İyi ve En Kötü İkililer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ana sayfaya yepyeni bir takım analizi eklendi. Birlikte en çok kazanan ve birlikte en çok kaybeden ikilileri görebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleClose} className="w-full font-bold text-sm mt-2 bg-gray-200 hover:bg-gray-300 text-gray-600">
            Harika! Oyuna Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
