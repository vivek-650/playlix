"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Settings2, Trash2, Play, Lock, Globe, Link2 } from "lucide-react"
import type { LibraryPlaylist } from "@/lib/types"

interface PlaylistCardProps {
  playlist: LibraryPlaylist
  onRemove: (id: string) => void
}

export function PlaylistCard({ playlist, onRemove }: PlaylistCardProps) {
  const completedCount = playlist.completedVideoIds.length
  const progress = playlist.totalVideos > 0 ? Math.round((completedCount / playlist.totalVideos) * 100) : 0

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-video bg-muted">
        {playlist.visibility && (
          <Badge className="absolute left-2 top-2 z-10 gap-1.5 bg-background/90 text-foreground border shadow-sm">
            {playlist.visibility === "PUBLIC" && <Globe className="h-3 w-3" />}
            {playlist.visibility === "PRIVATE" && <Lock className="h-3 w-3" />}
            {playlist.visibility === "UNLISTED" && <Link2 className="h-3 w-3" />}
            {playlist.visibility.toLowerCase()}
          </Badge>
        )}
        {playlist.thumbnailUrl ? (
          <Image
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            onRemove(playlist.id)
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Link href={`/library/${playlist.id}/settings`} className="absolute bottom-2 right-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
      <CardContent className="p-4">
        <Link href={`/watch/${playlist.id}`} className="hover:underline">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{playlist.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3">
          {playlist.channelTitle} &middot; {playlist.totalVideos} videos &middot; {playlist.totalDuration}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {completedCount}/{playlist.totalVideos} completed
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <Link href={`/watch/${playlist.id}`}>
          <Button variant="secondary" size="sm" className="w-full mt-3">
            {completedCount > 0 ? "Continue" : "Start Learning"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
