import type React from "react"
import type { Metadata } from "next"
import { Sora } from "next/font/google"
import "./globals.css"
import { RootProvider } from "@/components/root-provider"

const sora = Sora({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://playlix-beta.vercel.app"), // replace with your actual domain

  title: {
    default: "Playlix",
    template: "%s | Playlix",
  },

  description:
    "Learn from YouTube playlists without distractions. Track progress, take notes, and stay focused.",

  keywords: [
    "Playlix",
    "YouTube playlist learning",
    "study platform",
    "playlist tracker",
    "learning app",
    "focus learning",
    "student productivity",
    "notes from videos",
  ],

  authors: [{ name: "Playlix" }],
  creator: "Playlix",
  publisher: "Playlix",

  applicationName: "Playlix",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://playlix-beta.vercel.app", // replace with your actual domain
    siteName: "Playlix",
    title: "Playlix",
    description:
      "Learn from YouTube playlists without distractions. Track progress, take notes, and stay focused.",
    images: [
      {
        url: "/landing.jpg",
        width: 1200,
        height: 630,
        alt: "Playlix Landing Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Playlix",
    description:
      "Learn from YouTube playlists without distractions. Track progress, take notes, and stay focused.",
    images: ["/landing.jpg"],
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  robots: {
    index: true,
    follow: true,
  },
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