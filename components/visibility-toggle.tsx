"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Lock, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

type Visibility = "PRIVATE" | "PUBLIC" | "UNLISTED"

interface VisibilityToggleProps {
  playlistId: string
  currentVisibility: Visibility
  onVisibilityChange?: (visibility: Visibility) => void
}

export function VisibilityToggle({
  playlistId,
  currentVisibility,
  onVisibilityChange,
}: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState<Visibility>(currentVisibility)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleVisibilityChange = async (newVisibility: Visibility) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/playlists/${playlistId}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      })

      const data = await response.json()

      if (data.success) {
        setVisibility(newVisibility)
        onVisibilityChange?.(newVisibility)
        
        toast({
          title: "Success",
          description: `Playlist visibility changed to ${newVisibility.toLowerCase()}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update visibility",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update playlist visibility",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (vis: Visibility) => {
    switch (vis) {
      case "PUBLIC":
        return <Globe className="w-4 h-4" />
      case "PRIVATE":
        return <Lock className="w-4 h-4" />
      case "UNLISTED":
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getDescription = (vis: Visibility) => {
    switch (vis) {
      case "PUBLIC":
        return "Anyone can find and access this playlist in the community section"
      case "PRIVATE":
        return "Only you can access this playlist"
      case "UNLISTED":
        return "Only people with the link can access this playlist"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Visibility</label>
        <Select value={visibility} onValueChange={(value) => handleVisibilityChange(value as Visibility)}>
          <SelectTrigger disabled={loading}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRIVATE">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Private
              </div>
            </SelectItem>
            <SelectItem value="UNLISTED">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Unlisted
              </div>
            </SelectItem>
            <SelectItem value="PUBLIC">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Public
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-2">
          <div className="mt-0.5">{getIcon(visibility)}</div>
          <p className="text-sm text-blue-900">{getDescription(visibility)}</p>
        </div>
      </div>

      {visibility === "PUBLIC" && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-900 font-medium">
            ✓ This playlist is visible in the Community section
          </p>
        </div>
      )}
    </div>
  )
}
