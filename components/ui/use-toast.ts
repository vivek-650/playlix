"use client"

import { toast as sonnerToast } from "sonner"

type ToastArgs = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastArgs) => {
      const message = [title, description].filter(Boolean).join(" - ") || "Notification"

      if (variant === "destructive") {
        sonnerToast.error(message)
        return
      }

      sonnerToast(message)
    },
  }
}