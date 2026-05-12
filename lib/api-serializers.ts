import type { ActivityEvent, LearningStats, LibraryPlaylist, LibraryVideo, NoteFile } from "./types"

function formatDuration(seconds: number | null | undefined): string {
  const totalSeconds = Math.max(0, seconds ?? 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function toActivityType(type: string): ActivityEvent["type"] {
  switch (type) {
    case "VIDEO_COMPLETED":
      return "video_completed"
    case "PLAYLIST_ENROLLED":
      return "playlist_added"
    case "PLAYLIST_COMPLETED":
      return "playlist_completed"
    case "NOTE_CREATED":
      return "note_created"
    case "BOOKMARK_ADDED":
      return "bookmark_added"
    default:
      return "video_completed"
  }
}

export function serializePlaylist(playlist: any): LibraryPlaylist {
  const videos: LibraryVideo[] = (playlist.videos || []).map((video: any) => ({
    id: video.youtubeVideoId || video.id,
    title: video.title,
    thumbnailUrl: video.thumbnailUrl || "",
    duration: formatDuration(video.durationSeconds),
    position: video.position,
    resumeAtSeconds: video.userProgress?.[0]?.watchedSeconds || 0,
  }))

  const progressRecords = (playlist.videos || []).map((video: any) => video.userProgress?.[0]).filter(Boolean)
  const completedVideoIds = progressRecords
    .filter((progress: any) => progress.isCompleted)
    .map((progress: any) => progress.video?.youtubeVideoId || progress.videoId)
  const skippedVideoIds = progressRecords
    .filter((progress: any) => progress.isSkipped)
    .map((progress: any) => progress.video?.youtubeVideoId || progress.videoId)

  return {
    id: playlist.id,
    title: playlist.title,
    description: playlist.description || "",
    channelTitle: playlist.channelTitle || "",
    thumbnailUrl: playlist.thumbnailUrl || "",
    visibility: playlist.visibility,
    createdAt: playlist.createdAt instanceof Date ? playlist.createdAt.toISOString() : playlist.createdAt,
    updatedAt: playlist.updatedAt instanceof Date ? playlist.updatedAt.toISOString() : playlist.updatedAt,
    analytics: playlist.analytics
      ? {
          totalViews: playlist.analytics.totalViews || 0,
          totalEnrollments: playlist.analytics.totalEnrollments || 0,
          totalCompletions: playlist.analytics.totalCompletions || 0,
          totalLikes: playlist.analytics.totalLikes || 0,
          totalBookmarks: playlist.analytics.totalBookmarks || 0,
        }
      : undefined,
    videos,
    totalVideos: playlist.totalVideos ?? videos.length,
    totalDuration: formatDuration(playlist.totalDurationSeconds),
    addedAt: playlist.createdAt instanceof Date ? playlist.createdAt.toISOString() : playlist.createdAt,
    completedVideoIds,
    skippedVideoIds,
  }
}

export function serializePlaylists(playlists: any[]): LibraryPlaylist[] {
  return playlists.map(serializePlaylist)
}

export function serializeNote(note: any): NoteFile {
  return {
    id: note.id,
    title: note.title,
    content: note.content || "",
    playlistId: note.playlistId || undefined,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt,
  }
}

export function serializeNotes(notes: any[]): NoteFile[] {
  return notes.map(serializeNote)
}

export function serializeActivity(activity: any): ActivityEvent {
  return {
    id: activity.id,
    type: toActivityType(activity.type),
    title: activity.title || activity.type,
    playlistId: activity.playlistId || undefined,
    videoId: activity.videoId || undefined,
    timestamp: activity.createdAt instanceof Date ? activity.createdAt.toISOString() : activity.createdAt,
  }
}

export function serializeActivities(activity: any[]): ActivityEvent[] {
  return activity.map(serializeActivity)
}

export function serializeStats(stats: {
  totalPlaylists: number
  completedPlaylists: number
  totalVideos: number
  completedVideos: number
  currentStreak: number
}): LearningStats {
  return {
    ...stats,
    completionRate: stats.totalVideos > 0 ? Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0,
  }
}