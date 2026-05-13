"use client"

import { useState, useMemo } from "react"
import { useDataCache, invalidateCachePattern } from "@/hooks/use-data-cache"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlaylistCard } from "@/components/playlist-card"
import { AddPlaylistDialog } from "@/components/add-playlist-dialog"
import { EmptyState } from "@/components/empty-state"
import type { LibraryPlaylist } from "@/lib/types"
import { Library, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type SortOption = "recent" | "progress" | "added" | "name"

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("recent")
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

  async function handleRemove(id: string) {
    const response = await fetch(`/api/playlists/${id}`, { method: "DELETE" })
    const data = await response.json()
    if (data.success) {
      invalidateCachePattern("playlists:")
      await refetch()
    }
  }

  const handlePlaylistAdded = async () => {
    setShowAddDialog(false)
    invalidateCachePattern("playlists:")
    invalidateCachePattern("stats:")
    await refetch()
  }

  const playlistList = playlists ?? []

  const filtered = useMemo(() => {
    let list = playlistList.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.channelTitle.toLowerCase().includes(search.toLowerCase())
    )

    switch (sort) {
      case "recent":
        list.sort((a, b) => (b.lastWatchedAt || b.addedAt).localeCompare(a.lastWatchedAt || a.addedAt))
        break
      case "progress":
        list.sort((a, b) => {
          const pa = a.totalVideos > 0 ? a.completedVideoIds.length / a.totalVideos : 0
          const pb = b.totalVideos > 0 ? b.completedVideoIds.length / b.totalVideos : 0
          return pb - pa
        })
        break
      case "added":
        list.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        break
      case "name":
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return list
  }, [playlistList, search, sort])

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Library</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          Add Playlist
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : playlistList.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search playlists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Watched</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="added">Date Added</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!loading && playlistList.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Your library is empty"
          description="Add a YouTube playlist URL to start learning distraction-free."
        >
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            Add Playlist
          </Button>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No playlists match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <AddPlaylistDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdded={handlePlaylistAdded} />
    </div>
  )
}
