import { prisma } from "@/lib/db"
import type { Playlist, PlaylistEnrollment, VideoProgress } from "@prisma/client"

/**
 * Repository Layer Abstraction
 * Separates data access from business logic
 * 
 * Benefits:
 * - Enables caching strategies
 * - Allows raw SQL optimization
 * - Simplifies testing
 * - Future-proofs against DB changes
 */

// ============================================
// PLAYLIST REPOSITORY
// ============================================

export const playlistRepository = {
  async findById(id: string) {
    return prisma.playlist.findUnique({
      where: { id },
      include: {
        videos: { orderBy: { position: "asc" } },
        analytics: true,
      },
    })
  },

  async findBySlug(slug: string) {
    return prisma.playlist.findUnique({
      where: { slug },
      include: { videos: true, analytics: true },
    })
  },

  async findByUserId(userId: string) {
    return prisma.playlistEnrollment.findMany({
      where: { userId, playlist: { deletedAt: null } },
      include: {
        playlist: {
          include: {
            videos: true,
            analytics: true,
          },
        },
      },
      orderBy: { lastWatchedAt: { sort: "desc", nulls: "last" } },
    })
  },

  async create(data: any) {
    return prisma.playlist.create({ data })
  },

  async update(id: string, data: Partial<Playlist>) {
    return prisma.playlist.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return prisma.playlist.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}

// ============================================
// VIDEO REPOSITORY
// ============================================

export const videoRepository = {
  async findByPlaylistId(playlistId: string) {
    return prisma.video.findMany({
      where: { playlistId, deletedAt: null },
      orderBy: { position: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.video.findUnique({ where: { id } })
  },

  async createMany(data: any[]) {
    return prisma.video.createMany({ data, skipDuplicates: true })
  },
}

// ============================================
// VIDEO PROGRESS REPOSITORY
// ============================================

export const videoProgressRepository = {
  async findByUserAndPlaylist(userId: string, playlistId: string) {
    const videos = await prisma.video.findMany({
      where: { playlistId },
      orderBy: { position: "asc" },
    })

    const progress = await prisma.videoProgress.findMany({
      where: {
        userId,
        video: { playlistId },
      },
    })

    return { videos, progress }
  },

  async getProgress(userId: string, videoId: string) {
    return prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    })
  },

  async upsert(userId: string, videoId: string, data: any) {
    return prisma.videoProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: data,
      create: {
        userId,
        videoId,
        ...data,
      },
    })
  },

  async getCompletionStats(userId: string, playlistId: string) {
    return prisma.videoProgress.aggregate({
      where: {
        userId,
        video: { playlistId },
      },
      _count: {
        id: true,
      },
    })
  },
}

// ============================================
// PLAYLIST ENROLLMENT REPOSITORY
// ============================================

export const enrollmentRepository = {
  async findByUserAndPlaylist(userId: string, playlistId: string) {
    return prisma.playlistEnrollment.findUnique({
      where: { userId_playlistId: { userId, playlistId } },
    })
  },

  async createOrUpdate(userId: string, playlistId: string) {
    return prisma.playlistEnrollment.upsert({
      where: { userId_playlistId: { userId, playlistId } },
      update: { enrolledAt: new Date() },
      create: { userId, playlistId },
    })
  },

  async updateProgress(userId: string, playlistId: string, data: any) {
    return prisma.playlistEnrollment.update({
      where: { userId_playlistId: { userId, playlistId } },
      data,
    })
  },
}

// ============================================
// ACTIVITY REPOSITORY
// ============================================

export const activityRepository = {
  async log(data: any) {
    return prisma.activity.create({ data })
  },

  async getByUser(userId: string, limit = 20) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },

  async getByType(userId: string, type: string, limit = 10) {
    return prisma.activity.findMany({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },
}

// ============================================
// ANALYTICS REPOSITORY
// ============================================

export const analyticsRepository = {
  async getPlaylistStats(playlistId: string) {
    return prisma.playlistAnalytics.findUnique({
      where: { playlistId },
    })
  },

  async incrementView(playlistId: string) {
    return prisma.playlistAnalytics.update({
      where: { playlistId },
      data: { totalViews: { increment: 1 } },
    })
  },

  async incrementEnrollment(playlistId: string) {
    return prisma.playlistAnalytics.update({
      where: { playlistId },
      data: { totalEnrollments: { increment: 1 } },
    })
  },

  async incrementCompletion(playlistId: string) {
    return prisma.playlistAnalytics.update({
      where: { playlistId },
      data: { totalCompletions: { increment: 1 } },
    })
  },
}
