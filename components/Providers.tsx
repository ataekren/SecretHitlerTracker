"use client"

import { FirebaseDataProvider } from "@/lib/firebase-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseDataProvider>
      {children}
    </FirebaseDataProvider>
  )
}
