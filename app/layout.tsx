import type React from "react"
import type { Metadata } from "next"
import { Sora } from "next/font/google"
import "./globals.css"
import { RootProvider } from "@/components/root-provider"

const sora = Sora({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YTLearn - Learn from YouTube, without distractions",
  description: "Save YouTube playlists, track progress, take notes, and learn distraction-free",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={sora.className}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
