"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play } from "lucide-react"
import type { LibraryPlaylist } from "@/lib/types"

interface PlaylistCardProps {
  playlist: LibraryPlaylist
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const completedCount = playlist.completedVideoIds.length
  const progress = playlist.totalVideos > 0 ? Math.round((completedCount / playlist.totalVideos) * 100) : 0

  return (
    <Card className="overflow-hidden border-border/60 bg-card">
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
          <div className="flex items-center justify-center h-full">
            <Play className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <Link href={`/watch/${playlist.id}`} className="hover:underline">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{playlist.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3">By {playlist.channelTitle}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount}/{playlist.totalVideos} completed</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <Link href={`/watch/${playlist.id}`}>
          <Button size="sm" className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90">
            {completedCount > 0 ? "Continue" : "Start Course"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
