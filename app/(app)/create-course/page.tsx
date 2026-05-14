"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { extractPlaylistId, fetchPlaylistDetails } from "@/lib/youtube"
import type { LibraryPlaylist } from "@/lib/types"
import { Download, ListChecks, Settings, Eye, Loader2 } from "lucide-react"

export default function CreateCoursePage() {
  const router = useRouter()
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
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

      router.push(`/watch/${playlist.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import playlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create New Course</h1>
        <p className="text-sm text-muted-foreground">
          Convert YouTube playlists into distraction free structured courses instantly.
        </p>
      </div>

      <Card className="border-border/60 bg-card">
        <CardContent className="py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Import Playlist</p>
                <p className="text-xs text-muted-foreground">Add YouTube playlist URL</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Organize Videos</p>
                <p className="text-xs text-muted-foreground">Reorder and manage videos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Customize Course</p>
                <p className="text-xs text-muted-foreground">Add details and settings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Import YouTube Playlist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Playlist URL *</label>
                <Input
                  placeholder="Enter playlist URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="mt-2"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={loading || !url.trim()} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import Playlist"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setUrl("")} disabled={loading}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Course Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              See how your course will appear to other learners.
            </div>
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-muted text-sm text-muted-foreground">
              Course preview will appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
