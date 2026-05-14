"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { invalidateCachePattern } from "@/hooks/use-data-cache"
import { Users, Video, GraduationCap } from "lucide-react"

interface PublicPlaylist {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  slug: string
  totalVideos: number
  isEnrolled?: boolean
  analytics: {
    totalEnrollments: number
    totalViews: number
  }
  createdBy: {
    id: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
}

interface CommunityResponse {
  success: boolean
  data: PublicPlaylist[]
  error?: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function CommunitySection({ showHeader = true }: { showHeader?: boolean }) {
  const router = useRouter()
  const [playlists, setPlaylists] = useState<PublicPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/community/playlists?page=${page}&limit=20`)
        const data: CommunityResponse = await response.json()

        if (data.success && data.data && data.pagination) {
          setPlaylists(data.data)
          setTotalPages(data.pagination.pages)
          setError(null)
        } else {
          setError(data.error || "Failed to load public playlists")
        }
      } catch (err) {
        setError("Error loading public playlists")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPublicPlaylists()
  }, [page])

  async function handleEnroll(playlistId: string) {
    try {
      setJoiningId(playlistId)
      const response = await fetch(`/api/playlists/${playlistId}/enroll`, { method: "POST" })
      const data = await response.json()

      if (data.success) {
        invalidateCachePattern("playlists:")
        invalidateCachePattern("stats:")
        setPlaylists((prev) =>
          prev.map((playlist) =>
            playlist.id === playlistId ? { ...playlist, isEnrolled: true } : playlist
          )
        )
        router.push(`/watch/${playlistId}`)
      } else {
        setError(data.error || "Failed to enroll in playlist")
      }
    } finally {
      setJoiningId(null)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => setPage(1)}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h2 className="text-2xl font-semibold">Community Courses</h2>
          <p className="text-sm text-muted-foreground">Access courses created by other learners.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-2">No public playlists yet</p>
          <p className="text-sm">Create a public playlist to share with the community.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                <div className="relative aspect-video bg-muted">
                  {playlist.thumbnailUrl ? (
                    <Image
                      src={playlist.thumbnailUrl}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold line-clamp-2">{playlist.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      By {playlist.createdBy.firstName || "Unknown"} {playlist.createdBy.lastName || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5" />
                      {playlist.totalVideos} lectures
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {playlist.analytics.totalEnrollments} learners
                    </span>
                  </div>
                  <Button
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() =>
                      playlist.isEnrolled ? router.push(`/watch/${playlist.id}`) : handleEnroll(playlist.id)
                    }
                    disabled={joiningId === playlist.id}
                  >
                    {playlist.isEnrolled ? "Continue" : joiningId === playlist.id ? "Starting..." : (
                      <>
                        <GraduationCap className="h-4 w-4" />
                        Start Learning
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
