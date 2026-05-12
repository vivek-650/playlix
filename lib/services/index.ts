import { prisma } from "@/lib/db"
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api-errors"
import type { Playlist, Video } from "@prisma/client"

// ============================================
// PLAYLIST SERVICE
// ============================================

export const playlistService = {
  // Create a new playlist
  async create(userId: string, data: {
    youtubePlaylistId: string
    title: string
    description?: string
    channelTitle?: string
    thumbnailUrl?: string
    totalVideos?: number
    totalDurationSeconds?: number
  }) {
    return prisma.playlist.create({
      data: {
        userId,
        ...data,
        addedAt: new Date(),
      },
    })
  },

  // Get all user playlists
  async getAllByUser(userId: string) {
    return prisma.playlist.findMany({
      where: { userId, deletedAt: null },
      include: {
        videos: {
          select: {
            id: true,
            youtubeVideoId: true,
            title: true,
            isCompleted: true,
            isSkipped: true,
            position: true,
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { lastWatchedAt: "desc" },
    })
  },

  // Get single playlist
  async getById(playlistId: string, userId: string) {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { videos: { orderBy: { position: "asc" } } },
    })

    if (!playlist || playlist.deletedAt) throw new NotFoundError("Playlist")
    if (playlist.userId !== userId) throw new ForbiddenError("Cannot access this playlist")

    return playlist
  },

  // Update playlist
  async update(playlistId: string, userId: string, data: Partial<Playlist>) {
    const playlist = await this.getById(playlistId, userId)

    return prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  },

  // Soft delete playlist
  async delete(playlistId: string, userId: string) {
    await this.getById(playlistId, userId)

    return prisma.playlist.update({
      where: { id: playlistId },
      data: { deletedAt: new Date() },
    })
  },

  // Update last watched
  async updateLastWatched(playlistId: string, userId: string, videoId: string) {
    const playlist = await this.getById(playlistId, userId)

    return prisma.playlist.update({
      where: { id: playlistId },
      data: {
        lastWatchedAt: new Date(),
        lastWatchedVideoId: videoId,
      },
    })
  },

  // Get playlist by YouTube ID
  async getByYoutubeId(youtubePlaylistId: string, userId?: string) {
    const playlist = await prisma.playlist.findUnique({
      where: { youtubePlaylistId },
    })

    if (!playlist || playlist.deletedAt) throw new NotFoundError("Playlist")
    if (userId && playlist.userId !== userId) throw new ForbiddenError("Cannot access this playlist")

    return playlist
  },
}

// ============================================
// VIDEO SERVICE
// ============================================

export const videoService = {
  // Create videos for a playlist
  async createBatch(playlistId: string, userId: string, videos: Array<{
    youtubeVideoId: string
    title: string
    thumbnailUrl?: string
    durationSeconds?: number
    position: number
  }>) {
    // Verify playlist ownership
    const playlist = await playlistService.getById(playlistId, userId)

    return prisma.video.createMany({
      data: videos.map(v => ({
        ...v,
        playlistId,
        userId,
      })),
      skipDuplicates: true,
    })
  },

  // Get videos in playlist
  async getByPlaylistId(playlistId: string, userId: string) {
    await playlistService.getById(playlistId, userId)

    return prisma.video.findMany({
      where: { playlistId },
      orderBy: { position: "asc" },
    })
  },

  // Get single video
  async getById(videoId: string, userId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) throw new NotFoundError("Video")
    if (video.userId !== userId) throw new ForbiddenError("Cannot access this video")

    return video
  },

  // Toggle video completion
  async toggleComplete(videoId: string, userId: string) {
    const video = await this.getById(videoId, userId)

    return prisma.video.update({
      where: { id: videoId },
      data: {
        isCompleted: !video.isCompleted,
        updatedAt: new Date(),
      },
    })
  },

  // Toggle video skip
  async toggleSkip(videoId: string, userId: string) {
    const video = await this.getById(videoId, userId)

    return prisma.video.update({
      where: { id: videoId },
      data: {
        isSkipped: !video.isSkipped,
        updatedAt: new Date(),
      },
    })
  },

  // Save playback position
  async savePosition(videoId: string, userId: string, seconds: number) {
    const video = await this.getById(videoId, userId)

    return prisma.video.update({
      where: { id: videoId },
      data: {
        userPlayPosition: seconds,
        updatedAt: new Date(),
      },
    })
  },

  // Get video by YouTube ID
  async getByYoutubeId(youtubeVideoId: string, userId: string) {
    const video = await prisma.video.findFirst({
      where: { youtubeVideoId, userId },
    })

    if (!video) throw new NotFoundError("Video")
    return video
  },
}

// ============================================
// NOTE SERVICE
// ============================================

export const noteService = {
  // Create note
  async create(userId: string, data: {
    title: string
    content?: string
    playlistId?: string
  }) {
    return prisma.note.create({
      data: {
        userId,
        ...data,
      },
    })
  },

  // Get all user notes
  async getAllByUser(userId: string) {
    return prisma.note.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    })
  },

  // Get single note
  async getById(noteId: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    })

    if (!note || note.deletedAt) throw new NotFoundError("Note")
    if (note.userId !== userId) throw new ForbiddenError("Cannot access this note")

    return note
  },

  // Update note
  async update(noteId: string, userId: string, data: Partial<{
    title: string
    content: string
    playlistId: string | null
  }>) {
    await this.getById(noteId, userId)

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  },

  // Delete note
  async delete(noteId: string, userId: string) {
    await this.getById(noteId, userId)

    return prisma.note.update({
      where: { id: noteId },
      data: { deletedAt: new Date() },
    })
  },
}

// ============================================
// ACTIVITY SERVICE
// ============================================

export const activityService = {
  // Log activity
  async log(userId: string, data: {
    type: string
    title?: string
    playlistId?: string
    videoId?: string
  }) {
    return prisma.activity.create({
      data: {
        userId,
        ...data,
      },
    })
  },

  // Get user activity
  async getUserActivity(userId: string, limit = 20) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },
}

// ============================================
// USER SETTINGS SERVICE
// ============================================

export const userSettingsService = {
  // Get or create settings
  async getOrCreate(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          playbackSpeed: new Prisma.Decimal(1.0),
          autoAdvance: true,
        },
      })
    }

    return settings
  },

  // Update settings
  async update(userId: string, data: {
    playbackSpeed?: number
    autoAdvance?: boolean
  }) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    })
  },
}

// Import for Decimal type
import { Prisma } from "@prisma/client"
