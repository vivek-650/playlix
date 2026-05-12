"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VisibilityToggle } from "@/components/visibility-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PlaylistDetails {
  id: string
  title: string
  description?: string
  visibility: "PRIVATE" | "PUBLIC" | "UNLISTED"
  totalVideos: number
  createdAt: string
  analytics?: {
    totalEnrollments: number
    totalViews: number
  }
}

export default function PlaylistSettingsPage() {
  const params = useParams()
  const playlistId = params.id as string
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/playlists/${playlistId}`)
        const data = await response.json()

        if (data.success) {
          setPlaylist(data.data)
          setError(null)
        } else {
          setError(data.error || "Failed to load playlist")
        }
      } catch (err) {
        setError("Error loading playlist")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (playlistId) {
      fetchPlaylist()
    }
  }, [playlistId])

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Link href="/library">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </Link>
        <div className="text-red-500 text-center py-12">{error}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <p className="text-gray-500">Playlist not found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Link href={`/watch/${playlistId}`}>
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Playlist
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Playlist Info */}
        <Card>
          <CardHeader>
            <CardTitle>{playlist.title}</CardTitle>
            <CardDescription>{playlist.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Videos</p>
                <p className="text-2xl font-bold">{playlist.totalVideos}</p>
              </div>
              {playlist.analytics && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Enrollments</p>
                    <p className="text-2xl font-bold">{playlist.analytics.totalEnrollments}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Views</p>
                    <p className="text-2xl font-bold">{playlist.analytics.totalViews}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-sm">{new Date(playlist.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Playlist Visibility</CardTitle>
            <CardDescription>
              Control who can see your playlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisibilityToggle
              playlistId={playlistId}
              currentVisibility={playlist.visibility}
              onVisibilityChange={(newVisibility) => {
                setPlaylist({
                  ...playlist,
                  visibility: newVisibility,
                })
              }}
            />
          </CardContent>
        </Card>

        {/* Visibility Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            {playlist.visibility === "PUBLIC" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900 font-medium">
                  ✓ This playlist is public and visible in the Community section
                </p>
              </div>
            )}
            {playlist.visibility === "PRIVATE" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-medium">
                  🔒 This playlist is private and only visible to you
                </p>
              </div>
            )}
            {playlist.visibility === "UNLISTED" && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-900 font-medium">
                  🔗 This playlist is unlisted and only accessible via direct link
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
