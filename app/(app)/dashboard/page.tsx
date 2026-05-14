"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useDataCache, invalidateCachePattern } from "@/hooks/use-data-cache"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AddPlaylistDialog } from "@/components/add-playlist-dialog"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import type { LibraryPlaylist } from "@/lib/types"
import { Plus, Flame, BookOpen } from "lucide-react"
import { CommunitySection } from "@/components/community-section"

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

  const enrolledPlaylists = typedPlaylists || []

  if (!user) return null

  return (
    <div className="px-6 py-6 space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40 p-4 text-primary-foreground">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Learning Streak</span>
            <Flame className="h-4 w-4" />
          </div>
          <div className="mt-3 text-3xl font-bold">{stats?.currentStreak ?? 0}</div>
          <div className="text-sm opacity-90">days</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-secondary/90 via-secondary/70 to-secondary/40 p-4 text-foreground">
          <div className="text-sm text-muted-foreground">Create Courses In</div>
          <div className="mt-3 text-3xl font-bold">2</div>
          <div className="text-sm text-muted-foreground">minutes</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-accent/90 via-accent/70 to-accent/40 p-4 text-foreground">
          <div className="text-sm text-muted-foreground">Start Learning From</div>
          <div className="mt-3 text-3xl font-bold">45</div>
          <div className="text-sm text-muted-foreground">courses</div>
        </div>
      </div>

      {enrolledPlaylists.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Continue learning"
          description="Add your first YouTube playlist to begin your learning journey."
        >
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Playlist
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Continue Learning</h2>
            <p className="text-sm text-muted-foreground">Pick up right where you left.</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4">
              {(playlistsLoading ? Array.from({ length: 4 }) : enrolledPlaylists.slice(0, 8)).map((pl, index) => {
                if (!pl) {
                  return (
                    <div key={index} className="w-72 space-y-3">
                      <Skeleton className="aspect-video rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  )
                }

                const completed = pl.completedVideoIds?.length || 0
                const total = pl.totalVideos
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0

                return (
                  <Link key={pl.id} href={`/watch/${pl.id}`} className="min-w-[18rem]">
                    <div className="w-72 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg">
                      <div className="relative aspect-video bg-muted">
                        {pl.thumbnailUrl ? (
                          <Image src={pl.thumbnailUrl} alt={pl.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2">{pl.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">By {pl.channelTitle}</p>
                        <div className="mt-3 space-y-2">
                          <Progress value={percent} className="h-1.5" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{percent}% Completed</span>
                            <Button size="sm" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90">
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
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Community Courses</h2>
              <p className="text-sm text-muted-foreground">Explore playlists from other learners.</p>
            </div>
            <CommunitySection showHeader={false} />
          </div>
        </div>
      )}

      <AddPlaylistDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdded={handlePlaylistAdded} showTrigger={false} />
    </div>
  )
}
