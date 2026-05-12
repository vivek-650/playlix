"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { YouTubePlayer, type YouTubePlayerHandle } from "@/components/youtube-player"
import { WatchSidebar } from "@/components/watch-sidebar"
import { WatchNotes } from "@/components/watch-notes"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import type { LibraryPlaylist } from "@/lib/types"
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRight,
  ListVideo,
  StickyNote,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const SPEED_OPTIONS = ["0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"]

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const playlistId = params.playlistId as string
  const playerRef = useRef<YouTubePlayerHandle>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playlist, setPlaylist] = useState<LibraryPlaylist | null>(null)
  const [currentVideoId, setCurrentVideoId] = useState("")
  const [startAt, setStartAt] = useState(0)
  const [focusMode, setFocusMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [autoAdvance, setAutoAdvance] = useState(true)
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
        setAutoAdvance(Boolean(settingsData.data.autoAdvance))
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

  function refreshPlaylist() {
    return fetch(`/api/playlists/${playlistId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPlaylist(data.data)
          return data.data as LibraryPlaylist
        }
        return null
      })
  }

  function findNextPlayable(fromIndex: number, direction: 1 | -1): number {
    if (!playlist) return -1
    const skipped = new Set(playlist.skippedVideoIds || [])
    let index = fromIndex + direction

    while (index >= 0 && index < playlist.videos.length) {
      if (!skipped.has(playlist.videos[index].id)) return index
      index += direction
    }

    return -1
  }

  const currentIndex = playlist?.videos.findIndex((video) => video.id === currentVideoId) ?? -1

  const goNext = useCallback(() => {
    if (!playlist) return
    const nextIndex = findNextPlayable(currentIndex, 1)
    if (nextIndex === -1) return

    const nextVideo = playlist.videos[nextIndex]
    setCurrentVideoId(nextVideo.id)
    setStartAt(nextVideo.resumeAtSeconds || 0)
  }, [playlist, currentIndex])

  const goPrev = useCallback(() => {
    if (!playlist) return
    const prevIndex = findNextPlayable(currentIndex, -1)
    if (prevIndex === -1) return

    const prevVideo = playlist.videos[prevIndex]
    setCurrentVideoId(prevVideo.id)
    setStartAt(prevVideo.resumeAtSeconds || 0)
  }, [playlist, currentIndex])

  const toggleFocus = useCallback(() => {
    setFocusMode((prev) => !prev)
  }, [])

  useKeyboardShortcuts({ onNext: goNext, onPrev: goPrev, onToggleFocus: toggleFocus })

  function handleSelectVideo(videoId: string) {
    const video = playlist?.videos.find((item) => item.id === videoId)
    setCurrentVideoId(videoId)
    setStartAt(video?.resumeAtSeconds || 0)
  }

  async function handleToggleComplete(videoId: string) {
    await fetch(`/api/videos/${videoId}/complete`, { method: "POST" })
    await refreshPlaylist()
  }

  async function handleToggleSkip(videoId: string) {
    await fetch(`/api/videos/${videoId}/skip`, { method: "POST" })
    await refreshPlaylist()
  }

  async function handleVideoEnded() {
    const currentVideo = playlist?.videos.find((video) => video.id === currentVideoId)
    if (currentVideo && !playlist?.completedVideoIds.includes(currentVideo.id)) {
      await fetch(`/api/videos/${currentVideoId}/complete`, { method: "POST" })
      await refreshPlaylist()
    }

    if (autoAdvance) {
      goNext()
    }
  }

  function handleTimeUpdate(seconds: number) {
    if (!currentVideoId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)

    saveTimer.current = setTimeout(() => {
      fetch(`/api/videos/${currentVideoId}/position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds }),
      })
    }, 500)
  }

  async function handleSpeedChange(value: string) {
    const speed = parseFloat(value)
    setPlaybackSpeed(speed)
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbackSpeed: speed }),
    })
  }

  const getPlayerTime = useCallback(() => {
    return playerRef.current?.getCurrentTime() || 0
  }, [])

  const seekPlayerTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds)
  }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-4">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!playlist) return null

  const currentVideo = playlist.videos.find((video) => video.id === currentVideoId)
  const hasNext = findNextPlayable(currentIndex, 1) !== -1
  const hasPrev = findNextPlayable(currentIndex, -1) !== -1

  return (
    <div
      className={`flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] ${focusMode ? "fixed inset-0 z-50 bg-background h-screen" : ""}`}
    >
      <div className="flex-1 flex flex-col min-w-0">
        <div className="w-full">
          <YouTubePlayer
            ref={playerRef}
            videoId={currentVideoId}
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            playbackSpeed={playbackSpeed}
            startAt={startAt}
          />
        </div>

        <div className="flex items-center justify-between p-3 border-b gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={!hasPrev}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Prev</span>
            </Button>
            <Button variant="outline" size="sm" onClick={goNext} disabled={!hasNext}>
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map((speed) => (
                  <SelectItem key={speed} value={speed}>
                    {speed}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFocus}>
              {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {currentVideo && (
          <div className="p-4">
            <h1 className="text-lg font-semibold">{currentVideo.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Video {currentVideo.position} of {playlist.totalVideos} &middot; {playlist.channelTitle}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">N</kbd> Next{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd> Previous{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">F</kbd> Focus mode
            </p>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="w-full lg:w-80 xl:w-96 h-64 lg:h-full border-t lg:border-t-0 flex flex-col">
          <Tabs defaultValue="playlist" className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b bg-background h-9 shrink-0">
              <TabsTrigger value="playlist" className="flex-1 gap-1.5 text-xs">
                <ListVideo className="h-3.5 w-3.5" />
                Playlist
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 gap-1.5 text-xs">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="playlist" className="flex-1 mt-0 overflow-hidden">
              <WatchSidebar
                playlist={playlist}
                currentVideoId={currentVideoId}
                onSelectVideo={handleSelectVideo}
                onToggleComplete={handleToggleComplete}
                onToggleSkip={handleToggleSkip}
              />
            </TabsContent>
            <TabsContent value="notes" className="flex-1 mt-0 overflow-hidden">
              <WatchNotes
                playlistId={playlistId}
                playlistTitle={playlist.title}
                getCurrentTime={getPlayerTime}
                onSeekTo={seekPlayerTo}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}