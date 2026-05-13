"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe, Users, Video, Sparkles } from "lucide-react"

interface PublicPlaylist {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  slug: string
  totalVideos: number
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

export function CommunitySection() {
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Community Playlists</h2>
        <p className="text-gray-500">Discover and learn from playlists created by our community</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No public playlists yet</p>
          <p className="text-sm text-gray-400">Create a public playlist to share with the community!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="overflow-hidden border-border/60 bg-card/80 backdrop-blur">
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-background to-muted">
                  {playlist.thumbnailUrl ? (
                    <Image
                      src={playlist.thumbnailUrl}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-background to-muted">
                      <div className="rounded-full bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                        No thumbnail
                      </div>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <Badge className="gap-1.5 bg-background/90 text-foreground border shadow-sm">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  </div>
                  <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-1">
                      <Video className="h-3 w-3" />
                      {playlist.totalVideos} videos
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-1">
                      <Users className="h-3 w-3" />
                      {playlist.analytics.totalEnrollments}
                    </span>
                  </div>
                </div>
                <CardHeader className="space-y-2">
                  <CardTitle className="line-clamp-2 text-lg">{playlist.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {playlist.description || "A community playlist worth exploring."}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground space-y-1">
                  <p>
                    Created by {playlist.createdBy.firstName || "Unknown"} {playlist.createdBy.lastName || ""}
                  </p>
                  <p>{playlist.analytics.totalViews} views</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button className="w-full gap-2" onClick={() => handleEnroll(playlist.id)} disabled={joiningId === playlist.id}>
                    {joiningId === playlist.id ? (
                      "Joining..."
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Enroll & Watch
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
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
