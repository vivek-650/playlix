import { z } from "zod"

// ============================================
// PLAYLIST VALIDATORS
// ============================================

export const CreatePlaylistSchema = z.object({
  youtubePlaylistId: z.string().min(1, "Playlist ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  channelTitle: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  totalVideos: z.number().int().nonnegative().optional(),
  totalDurationSeconds: z.number().int().nonnegative().optional(),
})

export const UpdatePlaylistSchema = CreatePlaylistSchema.partial()

export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>
export type UpdatePlaylistInput = z.infer<typeof UpdatePlaylistSchema>

// ============================================
// VIDEO VALIDATORS
// ============================================

export const CreateVideoSchema = z.object({
  playlistId: z.string().min(1, "Playlist ID is required"),
  youtubeVideoId: z.string().min(1, "YouTube video ID is required"),
  title: z.string().min(1, "Title is required"),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  position: z.number().int().nonnegative(),
})

export const UpdateVideoSchema = z.object({
  isCompleted: z.boolean().optional(),
  isSkipped: z.boolean().optional(),
  userPlayPosition: z.number().int().nonnegative().optional(),
})

export type CreateVideoInput = z.infer<typeof CreateVideoSchema>
export type UpdateVideoInput = z.infer<typeof UpdateVideoSchema>

// ============================================
// NOTE VALIDATORS
// ============================================

export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  playlistId: z.string().optional(),
})

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  playlistId: z.string().nullable().optional(),
})

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>

// ============================================
// BOOKMARK VALIDATORS
// ============================================

export const CreateBookmarkSchema = z.object({
  videoId: z.string().min(1, "Video ID is required"),
  youtubeVideoId: z.string().min(1, "YouTube video ID is required"),
  playlistId: z.string().min(1, "Playlist ID is required"),
  timestamp: z.number().int().nonnegative(),
  label: z.string().optional(),
})

export const DeleteBookmarkSchema = z.object({
  id: z.string().min(1, "Bookmark ID is required"),
})

export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>

// ============================================
// USER SETTINGS VALIDATORS
// ============================================

export const UpdateSettingsSchema = z.object({
  playbackSpeed: z.number().min(0.25).max(2).optional(),
  autoAdvance: z.boolean().optional(),
})

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>
