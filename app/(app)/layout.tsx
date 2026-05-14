import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"

export const metadata: Metadata = {
  title: "Playlix",
  description: "Learn from YouTube playlists without distractions.",
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
