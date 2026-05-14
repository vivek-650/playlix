'use client'

import type React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Analytics />
      </ThemeProvider>
    </ClerkProvider>
  )
}
