/**
 * REFACTORED SERVICE LAYER
 * Module-based architecture for scalability
 * 
 * Each service is a self-contained module with:
 * - Specific responsibility
 * - Repository abstraction
 * - Event emission
 * - Error handling
 */

import { prisma } from "@/lib/db"
import { emitEvent, EventType } from "@/lib/events"
import { ForbiddenError, NotFoundError, ConflictError } from "@/lib/api-errors"
import type { Prisma } from "@prisma/client"

// ============================================
// PLAYLIST SERVICE
// ============================================

export const playlistService = {
  async enrollPlaylist(userId: string, playlistId: string) {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist) throw new NotFoundError("Playlist")

    const existing = await prisma.playlistEnrollment.findUnique({
      where: { userId_playlistId: { userId, playlistId } },
    })

    if (existing) throw new ConflictError("Already enrolled in this playlist")

    const enrollment = await prisma.playlistEnrollment.create({
      data: { userId, playlistId },
    })

    // Emit event for side effects
    await emitEvent(EventType.PLAYLIST_ENROLLED, userId, {
      playlistId,
    })

    return enrollment
  },

  async getEnrolledPlaylists(userId: string) {
    return prisma.playlistEnrollment.findMany({
      where: { userId },
      include: {
        playlist: {
          include: { videos: true, analytics: true },
        },
      },
    })
  },

  async getPlaylist(playlistId: string, userId: string) {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        videos: {
          orderBy: { position: "asc" },
          include: {
            userProgress: { where: { userId } },
          },
        },
        analytics: true,
      },
    })

    if (!playlist) {
      throw new NotFoundError("Playlist")
    }

    if (playlist.createdById !== userId) {
      const enrollment = await prisma.playlistEnrollment.findUnique({
        where: { userId_playlistId: { userId, playlistId } },
      })

      if (!enrollment) {
        throw new ForbiddenError("Not enrolled in this playlist")
      }
    }

    return playlist
  },

  async getPlaylistById(playlistId: string) {
    return prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        videos: { orderBy: { position: "asc" } },
        analytics: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })
  },

  async createPlaylist(userId: string, data: any) {
    const slug = this.generateSlug(data.title)

    const playlist = await prisma.playlist.create({
      data: {
        ...data,
        slug,
        createdById: userId,
        analytics: { create: {} },
      },
    })

    // Emit event
    await emitEvent(EventType.PLAYLIST_CREATED, userId, {
      playlistId: playlist.id,
    })

    return playlist
  },

  async getUserPlaylists(userId: string) {
    return prisma.playlist.findMany({
      where: { createdById: userId, deletedAt: null },
      include: {
        videos: {
          include: {
            userProgress: { where: { userId } },
          },
        },
        analytics: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  },

  async getPublicPlaylists(limit = 20, skip = 0) {
    const playlists = await prisma.playlist.findMany({
      where: { visibility: "PUBLIC", deletedAt: null, status: "READY" },
      include: {
        videos: true,
        analytics: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    })

    // Sort by analytics engagement if available
    return playlists.sort((a, b) => {
      const aEnrollments = a.analytics?.totalEnrollments || 0
      const bEnrollments = b.analytics?.totalEnrollments || 0
      return bEnrollments - aEnrollments
    })
  },

  async updatePlaylistVisibility(userId: string, playlistId: string, visibility: "PRIVATE" | "PUBLIC" | "UNLISTED") {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist) throw new NotFoundError("Playlist")
    if (playlist.createdById !== userId) throw new ForbiddenError("Cannot modify this playlist")

    return prisma.playlist.update({
      where: { id: playlistId },
      data: { visibility },
      include: {
        analytics: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })
  },

  async deletePlaylist(userId: string, playlistId: string) {
    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } })

    if (!playlist) throw new NotFoundError("Playlist")
    if (playlist.createdById !== userId) throw new ForbiddenError("Cannot modify this playlist")

    return prisma.playlist.update({
      where: { id: playlistId },
      data: { deletedAt: new Date() },
    })
  },

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  },
}

// ============================================
// VIDEO SERVICE
// ============================================

export const videoService = {
  async createBatch(
    playlistId: string,
    userId: string,
    videos: Array<{
      youtubeVideoId: string
      title: string
      thumbnailUrl?: string
      durationSeconds?: number
      position: number
    }>
  ) {
    await playlistService.getPlaylist(playlistId, userId)

    return prisma.video.createMany({
      data: videos.map((video) => ({
        ...video,
        playlistId,
      })),
      skipDuplicates: true,
    })
  },

  async completeVideo(userId: string, videoId: string) {
    const progress = await prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    })

    const updated = progress
      ? await prisma.videoProgress.update({
          where: { userId_videoId: { userId, videoId } },
          data: {
            isCompleted: !progress.isCompleted,
            completedAt: !progress.isCompleted ? new Date() : null,
          },
        })
      : await prisma.videoProgress.create({
          data: {
            userId,
            videoId,
            isCompleted: true,
            completedAt: new Date(),
          },
        })

    // Emit event
    if (updated.isCompleted) {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { playlist: true },
      })

      await emitEvent(EventType.VIDEO_COMPLETED, userId, {
        videoId,
        playlistId: video?.playlistId,
      })
    }

    return updated
  },

  async skipVideo(userId: string, videoId: string) {
    const progress = await prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    })

    return progress
      ? prisma.videoProgress.update({
          where: { userId_videoId: { userId, videoId } },
          data: { isSkipped: !progress.isSkipped },
        })
      : prisma.videoProgress.create({
          data: {
            userId,
            videoId,
            isSkipped: true,
          },
        })
  },

  async savePosition(userId: string, videoId: string, seconds: number) {
    return prisma.videoProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: {
        watchedSeconds: seconds,
        lastWatchedAt: new Date(),
      },
      create: {
        userId,
        videoId,
        watchedSeconds: seconds,
        lastWatchedAt: new Date(),
      },
    })
  },

  async getProgress(userId: string, playlistId: string) {
    return prisma.videoProgress.findMany({
      where: {
        userId,
        video: { playlistId },
      },
    })
  },
}

// ============================================
// NOTE SERVICE
// ============================================

export const noteService = {
  async createNote(userId: string, data: any) {
    return prisma.note.create({
      data: {
        userId,
        ...data,
      },
    })
  },

  async getNotes(userId: string) {
    return prisma.note.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    })
  },

  async updateNote(userId: string, noteId: string, data: any) {
    const note = await prisma.note.findUnique({ where: { id: noteId } })

    if (!note || note.userId !== userId) {
      throw new ForbiddenError("Cannot access this note")
    }

    return prisma.note.update({
      where: { id: noteId },
      data,
    })
  },

  async deleteNote(userId: string, noteId: string) {
    const note = await prisma.note.findUnique({ where: { id: noteId } })

    if (!note || note.userId !== userId) {
      throw new ForbiddenError("Cannot access this note")
    }

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
  async getUserActivity(userId: string, limit = 20) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },

  async getActivityByType(userId: string, type: string, limit = 10) {
    return prisma.activity.findMany({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },
}

// ============================================
// USER SERVICE
// ============================================

export const userService = {
  async getSettings(userId: string) {
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

  async updateSettings(userId: string, data: any) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
  },

  async getStats(userId: string) {
    const enrollments = await prisma.playlistEnrollment.findMany({
      where: { userId },
      include: { playlist: true },
    })

    const streak = await prisma.streak.findUnique({
      where: { userId },
    })

    // Calculate stats from progress data
    const allProgress = await prisma.videoProgress.findMany({
      where: { userId },
    })

    return {
      totalPlaylists: enrollments.length,
      completedPlaylists: enrollments.filter(e => e.completedAt).length,
      totalVideos: allProgress.length,
      completedVideos: allProgress.filter(p => p.isCompleted).length,
      currentStreak: streak?.currentStreak || 0,
    }
  },
}
