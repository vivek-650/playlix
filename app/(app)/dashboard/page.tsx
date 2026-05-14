"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useDataCache, invalidateCachePattern } from "@/hooks/use-data-cache"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AddPlaylistDialog } from "@/components/add-playlist-dialog"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import type { LibraryPlaylist, LearningStats } from "@/lib/types"
import { Play, Plus, TrendingUp, Flame, CheckCircle2, BookOpen } from "lucide-react"

export default function DashboardPage() {
  const { user } = useUser()
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Fetch playlists with caching (5 min TTL)
  const {
    data: playlists = [],
    loading: playlistsLoading,
    refetch: refetchPlaylists,
  } = useDataCache(
    "playlists:all",
    async () => {
      const res = await fetch("/api/playlists")
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data || []
    },
    { ttl: 5 * 60 * 1000, revalidateOnFocus: true }
  )

  // Fetch stats with caching (5 min TTL)
  const { data: stats } = useDataCache(
    "stats:user",
    async () => {
      const res = await fetch("/api/stats")
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    { ttl: 5 * 60 * 1000, revalidateOnFocus: true }
  )

  // Handle playlist added
  const handlePlaylistAdded = async () => {
    setShowAddDialog(false)
    // Invalidate caches and refetch
    invalidateCachePattern("playlists:")
    invalidateCachePattern("stats:")
    await refetchPlaylists()
  }

  const typedPlaylists: LibraryPlaylist[] = playlists

  // Find most recently watched
  const continuePlaylist = typedPlaylists
    ?.sort((a, b) => (b.lastWatchedAt || b.addedAt).localeCompare(a.lastWatchedAt || a.addedAt))
    ?.find((p) => p.completedVideoIds?.length < p.totalVideos)

  // All enrolled playlists
  const enrolledPlaylists = typedPlaylists || []

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Enrollments</h1>
              <p className="text-sm text-muted-foreground mt-1">Access all your enrolled courses in one place.</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Playlist
            </Button>
          </div>
        </div>
      </div>

      {/* Top strip with date and actions */}
      <div className="bg-background border-b">
        <div className="container px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50">
              <Flame className="h-4 w-4 text-pink-500" />
              <span className="text-sm">0 days</span>
            </div>
            <Button className="bg-pink-600 text-white hover:bg-pink-500" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* Hero metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg p-4 bg-gradient-to-r from-pink-600 to-orange-500 text-white">
            <div className="text-sm opacity-90">Learning Streak</div>
            <div className="text-2xl font-bold mt-2">0 days</div>
            <div className="text-sm opacity-90 mt-1">Keep your learning momentum</div>
          </div>
          <div className="rounded-lg p-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
            <div className="text-sm opacity-90">Create Courses In</div>
            <div className="text-2xl font-bold mt-2">2 minutes</div>
            <div className="text-sm opacity-90 mt-1">Publish content quickly</div>
          </div>
          <div className="rounded-lg p-4 bg-gradient-to-r from-violet-500 to-pink-400 text-white">
            <div className="text-sm opacity-90">Start Learning From</div>
            <div className="text-2xl font-bold mt-2">45 courses</div>
            <div className="text-sm opacity-90 mt-1">Explore community content</div>
          </div>
        </div>
        {enrolledPlaylists.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Get started learning"
            description="Add your first YouTube playlist to begin your learning journey distraction-free."
          >
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Playlist
            </Button>
          </EmptyState>
        ) : (
          <>
            {/* Continue Learning Section (horizontal carousel) */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Continue Learning
              </h2>

              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4">
                  {enrolledPlaylists.slice(0, 8).map((pl) => {
                    const completed = pl.completedVideoIds?.length || 0
                    const total = pl.totalVideos
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                    return (
                      <Link key={pl.id} href={`/watch/${pl.id}`} className="min-w-[18rem]">
                        <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow w-72">
                          <div className="relative h-40 bg-muted">
                            {pl.thumbnailUrl ? (
                              <Image src={pl.thumbnailUrl} alt={pl.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="h-5 w-5 text-black" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm line-clamp-2">{pl.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">By {pl.channelTitle}</p>
                            <div className="mt-3">
                              <Progress value={percent} className="h-2" />
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">{percent}% Completed</p>
                                <Button size="sm" className="bg-pink-600 text-white hover:bg-pink-500">
                                  Continue
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.totalPlaylists}</p>
                          <p className="text-xs text-muted-foreground">Enrolled</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.completedVideos}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Flame className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.currentStreak}</p>
                          <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.completionRate}%</p>
                          <p className="text-xs text-muted-foreground">Completion</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* All Enrollments */}
            <div>
              <h2 className="text-lg font-semibold mb-4">All Courses</h2>
              {playlistsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-video rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {enrolledPlaylists.map((playlist) => {
                    const completed = playlist.completedVideoIds?.length || 0
                    const total = playlist.totalVideos
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

                    return (
                      <Link key={playlist.id} href={`/watch/${playlist.id}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            {playlist.thumbnailUrl ? (
                              <Image
                                src={playlist.thumbnailUrl}
                                alt={playlist.title}
                                fill
                                className="object-cover hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}

                            {/* Completion Badge */}
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1">
                              <span className="text-xs font-semibold text-white">{percentage}%</span>
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <h3 className="font-semibold line-clamp-2 text-sm">{playlist.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              By {playlist.channelTitle}
                            </p>

                            <div className="mt-3 space-y-2">
                              <Progress value={percentage} className="h-1.5" />
                              <p className="text-xs text-muted-foreground">
                                {completed}/{total} videos
                              </p>
                            </div>

                            <Button
                              size="sm"
                              className="w-full mt-3"
                              variant={percentage === 100 ? "secondary" : "default"}
                            >
                              {percentage === 100 ? "Review" : "Continue"}
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AddPlaylistDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdded={handlePlaylistAdded} />
    </div>
  )
}
