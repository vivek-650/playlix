"use client"

import { useState } from "react"
import { useDataCache, invalidateCachePattern } from "@/hooks/use-data-cache"
import { Button } from "@/components/ui/button"
import { PlaylistCard } from "@/components/playlist-card"
import { AddPlaylistDialog } from "@/components/add-playlist-dialog"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import type { LibraryPlaylist } from "@/lib/types"
import { Library, Plus } from "lucide-react"

export default function LibraryPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: playlists = [], loading, error, refetch } = useDataCache(
    "playlists:library",
    async () => {
      const response = await fetch("/api/playlists")
      const data = await response.json()
      if (data.success) {
        return data.data || []
      } else {
        throw new Error(data.error || "Failed to load playlists")
      }
    },
    { ttl: 5 * 60 * 1000, revalidateOnFocus: true }
  )

  const handlePlaylistAdded = async () => {
    setShowAddDialog(false)
    invalidateCachePattern("playlists:")
    invalidateCachePattern("stats:")
    await refetch()
  }

  const playlistList: LibraryPlaylist[] = playlists ?? []

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <p className="text-sm text-muted-foreground">Access all your enrolled courses in one place.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : playlistList.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No enrollments yet"
          description="Add a YouTube playlist URL to start learning."
        >
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Playlist
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlistList.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      <AddPlaylistDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdded={handlePlaylistAdded} showTrigger={false} />
    </div>
  )
}
