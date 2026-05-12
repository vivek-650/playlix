"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LibraryPlaylist, LearningStats, DailyCompletions } from "@/lib/types"
import { ContributionGraph } from "@/components/contribution-graph"
import { BookOpen, CheckCircle2, Flame, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const { user } = useUser()
  const [library, setLibrary] = useState<LibraryPlaylist[]>([])
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletions>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    Promise.all([fetch("/api/playlists"), fetch("/api/stats"), fetch("/api/activity")])
      .then(async ([playlistsRes, statsRes, activityRes]) => {
        const playlistsData = await playlistsRes.json()
        const statsData = await statsRes.json()
        const activityData = await activityRes.json()

        if (playlistsData.success) setLibrary(playlistsData.data || [])
        if (statsData.success) setStats(statsData.data)

        const completions: DailyCompletions = {}
        if (activityData.success) {
          for (const event of activityData.data || []) {
            if (event.type === "video_completed" || event.type === "playlist_completed") {
              const day = new Date(event.timestamp).toISOString().slice(0, 10)
              completions[day] = (completions[day] || 0) + 1
            }
          }
        }
        setDailyCompletions(completions)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("focus", refresh)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("focus", refresh)
    }
  }, [refresh])

  if (!user) return null

  const initials = user.firstName?.charAt(0) || user.username?.charAt(0) || "U"

  return (
    <div className="container px-4 py-6 max-w-3xl">
      {/* User info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user.fullName || "User"}</h1>
              <p className="text-sm text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.totalPlaylists}</p>
              <p className="text-xs text-muted-foreground">Playlists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.completedVideos}</p>
              <p className="text-xs text-muted-foreground">Videos Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contribution Graph */}
      {!loading && <ContributionGraph data={dailyCompletions} />}

      {/* All playlists */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Playlists</CardTitle>
        </CardHeader>
        <CardContent>
          {library.length === 0 ? (
            <p className="text-sm text-muted-foreground">No playlists yet.</p>
          ) : (
            <div className="space-y-3">
              {library.map((p) => {
                const progress =
                  p.totalVideos > 0
                    ? Math.round((p.completedVideoIds.length / p.totalVideos) * 100)
                    : 0
                return (
                  <Link key={p.id} href={`/watch/${p.id}`} className="block">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.channelTitle} &middot; {p.completedVideoIds.length}/{p.totalVideos} videos
                        </p>
                        <Progress value={progress} className="h-1 mt-1" />
                      </div>
                      <span className="text-sm font-medium shrink-0">{progress}%</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
