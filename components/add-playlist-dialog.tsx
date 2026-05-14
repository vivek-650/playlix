"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Loader2 } from "lucide-react"
import { extractPlaylistId, fetchPlaylistDetails } from "@/lib/youtube"
import type { LibraryPlaylist } from "@/lib/types"

interface AddPlaylistDialogProps {
  onAdded: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export function AddPlaylistDialog({
  onAdded,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: AddPlaylistDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function durationToSeconds(duration: string): number {
    const parts = duration.split(":").map((part) => Number(part))
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
    return 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const playlistId = extractPlaylistId(url)
    if (!playlistId) {
      setError("Invalid YouTube playlist URL. Please paste a valid URL.")
      return
    }

    setLoading(true)
    try {
      const data = await fetchPlaylistDetails(playlistId)

      const totalDurationSeconds = data.videos.reduce((sum, video) => sum + durationToSeconds(video.duration), 0)

      const createResponse = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubePlaylistId: data.id,
          title: data.title,
          description: data.description,
          channelTitle: data.channelTitle,
          thumbnailUrl: data.thumbnailUrl,
          totalVideos: data.totalVideos,
          totalDurationSeconds,
        }),
      })

      const createPayload = await createResponse.json()

      if (!createPayload.success) {
        throw new Error(createPayload.error || "Failed to create playlist")
      }

      const playlist: LibraryPlaylist = createPayload.data

      await fetch(`/api/playlists/${playlist.id}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: data.videos.map((video) => ({
            youtubeVideoId: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            durationSeconds: durationToSeconds(video.duration),
            position: video.position,
          })),
        }),
      })

      setUrl("")
      setOpen(false)
      onAdded()
    } catch {
      setError("Failed to fetch playlist. Check the URL and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Playlist
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add YouTube Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Paste YouTube playlist URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !url.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Playlist"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
