"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { YouTubePlayer, type YouTubePlayerHandle } from "@/components/youtube-player"
import { WatchSidebar } from "@/components/watch-sidebar"
import { WatchNotes } from "@/components/watch-notes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { LibraryPlaylist } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Flame, ListVideo, StickyNote } from "lucide-react"
import { getEffectiveCounts, getTimeRemaining } from "@/lib/storage"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const playlistId = params.playlistId as string
  const playerRef = useRef<YouTubePlayerHandle>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playlist, setPlaylist] = useState<LibraryPlaylist | null>(null)
  const [currentVideoId, setCurrentVideoId] = useState("")
  const [startAt, setStartAt] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [loading, setLoading] = useState(true)

  const chooseInitialVideo = useCallback((data: LibraryPlaylist | null) => {
    if (!data || data.videos.length === 0) return null

    return (
      data.videos.find(
        (video) =>
          !data.completedVideoIds.includes(video.id) &&
          !(data.skippedVideoIds || []).includes(video.id)
      ) || data.videos[0]
    )
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [playlistRes, settingsRes] = await Promise.all([
        fetch(`/api/playlists/${playlistId}`),
        fetch("/api/settings"),
      ])

      const playlistData = await playlistRes.json()
      const settingsData = await settingsRes.json()

      if (!playlistData.success) {
        router.push("/library")
        return
      }

      const data: LibraryPlaylist = playlistData.data
      setPlaylist(data)

      const initialVideo = chooseInitialVideo(data)
      if (initialVideo) {
        setCurrentVideoId(initialVideo.id)
        setStartAt(initialVideo.resumeAtSeconds || 0)
      }

      if (settingsData.success && settingsData.data) {
        setPlaybackSpeed(Number(settingsData.data.playbackSpeed) || 1)
      }
    } catch (error) {
      console.error(error)
      router.push("/library")
    } finally {
      setLoading(false)
    }
  }, [chooseInitialVideo, playlistId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const currentIndex = playlist?.videos.findIndex((video) => video.id === currentVideoId) ?? -1
  const currentVideo = playlist?.videos.find((video) => video.id === currentVideoId)

  const { totalActive = 0, completedActive = 0, progress = 0 } = playlist
    ? getEffectiveCounts(playlist)
    : {}
  const timeLeft = playlist ? getTimeRemaining(playlist) : ""

  async function refreshPlaylist() {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`)
      const data = await response.json()
      if (data.success) {
        setPlaylist(data.data)
        return data.data as LibraryPlaylist
      }
    } catch (error) {
      console.error(error)
    }
    return null
  }

  function handleSelectVideo(videoId: string) {
    const video = playlist?.videos.find((item) => item.id === videoId)
    setCurrentVideoId(videoId)
    setStartAt(video?.resumeAtSeconds || 0)
  }

  async function handleToggleComplete(videoId: string) {
    if (!playlist) return

    const isCompleted = playlist.completedVideoIds.includes(videoId)
    const nextCompleted = isCompleted
      ? playlist.completedVideoIds.filter((id) => id !== videoId)
      : [...playlist.completedVideoIds, videoId]

    setPlaylist({
      ...playlist,
      completedVideoIds: nextCompleted,
    })

    try {
      const response = await fetch(`/api/videos/${videoId}/complete`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to toggle completion")
      await refreshPlaylist()
    } catch (error) {
      setPlaylist({
        ...playlist,
        completedVideoIds: playlist.completedVideoIds,
      })
      console.error(error)
    }
  }

  async function handleToggleSkip(videoId: string) {
    if (!playlist) return

    const isSkipped = playlist.skippedVideoIds?.includes(videoId)
    const nextSkipped = isSkipped
      ? (playlist.skippedVideoIds || []).filter((id) => id !== videoId)
      : [...(playlist.skippedVideoIds || []), videoId]

    setPlaylist({
      ...playlist,
      skippedVideoIds: nextSkipped,
    })

    try {
      const response = await fetch(`/api/videos/${videoId}/skip`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to toggle skip")
      await refreshPlaylist()
    } catch (error) {
      setPlaylist({
        ...playlist,
        skippedVideoIds: playlist.skippedVideoIds,
      })
      console.error(error)
    }
  }

  async function handleVideoEnded() {
    const currentVideo = playlist?.videos.find((video) => video.id === currentVideoId)
    if (currentVideo && playlist && !playlist.completedVideoIds.includes(currentVideo.id)) {
      setPlaylist({
        ...playlist,
        completedVideoIds: [...playlist.completedVideoIds, currentVideoId],
      })

      try {
        await fetch(`/api/videos/${currentVideoId}/complete`, { method: "POST" })
      } catch (error) {
        console.error("Failed to mark video as completed", error)
      }
    }
  }

  function handleTimeUpdate(seconds: number) {
    if (!currentVideoId || !playlist) return
    if (saveTimer.current) clearTimeout(saveTimer.current)

    const updatedVideos = playlist.videos.map((v) =>
      v.id === currentVideoId ? { ...v, resumeAtSeconds: seconds } : v
    )
    setPlaylist({ ...playlist, videos: updatedVideos })

    saveTimer.current = setTimeout(() => {
      fetch(`/api/videos/${currentVideoId}/position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds }),
      }).catch((error) => console.error("Failed to save position", error))
    }, 500)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{playlist.title}</h1>
            <p className="text-sm text-muted-foreground">{playlist.channelTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm sm:flex">
            <Flame className="h-4 w-4 text-primary" />
            <span>1 day</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{Math.round(progress)}%</span>
            <Progress value={progress} className="h-1.5 w-40" />
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 overflow-y-auto">
          <div className="p-0 lg:p-0">
            <YouTubePlayer
              ref={playerRef}
              videoId={currentVideoId}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdate}
              playbackSpeed={playbackSpeed}
              startAt={startAt}
            />
          </div>

          {currentVideo && (
            <div className="px-4 py-4 lg:px-6">
              <h2 className="text-xl font-semibold">{currentVideo.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Video {currentVideo.position} of {playlist.totalVideos}
              </p>
            </div>
          )}
        </div>

        <aside className="min-h-0 border-l bg-background">
          <Tabs defaultValue="playlist" className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-background p-0">
              <TabsTrigger value="playlist" className="gap-2 rounded-none data-[state=active]:bg-accent">
                <ListVideo className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2 rounded-none data-[state=active]:bg-accent">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2 rounded-none data-[state=active]:bg-accent">
                <span className="h-4 w-4 text-center text-xs font-semibold">i</span>
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="playlist" className="m-0 flex-1 overflow-hidden">
              <WatchSidebar
                playlist={playlist}
                currentVideoId={currentVideoId}
                onSelectVideo={handleSelectVideo}
                onToggleComplete={handleToggleComplete}
                onToggleSkip={handleToggleSkip}
              />
            </TabsContent>

            <TabsContent value="notes" className="m-0 flex-1 overflow-hidden">
              <WatchNotes
                playlistId={playlistId}
                playlistTitle={playlist.title}
              />
            </TabsContent>

            <TabsContent value="summary" className="m-0 flex-1 overflow-auto p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {completedActive}/{totalActive} completed
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{timeLeft} left</p>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}
