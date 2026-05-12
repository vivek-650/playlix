/**
 * EVENT-DRIVEN ARCHITECTURE
 * 
 * Decouples concerns:
 * - Video completion → triggers streak update, analytics, notifications separately
 * - Playlist enrollment → triggers welcome email, analytics
 * - Bookmark added → triggers analytics, recommendations
 * 
 * This is CRITICAL for scalability and performance.
 */

// ============================================
// EVENT TYPES
// ============================================

export enum EventType {
  // Video events
  VIDEO_COMPLETED = "video.completed",
  VIDEO_SKIPPED = "video.skipped",
  VIDEO_POSITION_UPDATED = "video.position_updated",

  // Playlist events
  PLAYLIST_ENROLLED = "playlist.enrolled",
  PLAYLIST_COMPLETED = "playlist.completed",
  PLAYLIST_CREATED = "playlist.created",

  // Note events
  NOTE_CREATED = "note.created",

  // Bookmark events
  BOOKMARK_ADDED = "bookmark.added",

  // User events
  USER_CREATED = "user.created",
}

export interface DomainEvent {
  type: EventType
  userId: string
  data: Record<string, any>
  timestamp: Date
  correlationId?: string
}

// ============================================
// EVENT STORE
// In-memory for now, can be replaced with Redis/Kafka
// ============================================

type EventHandler = (event: DomainEvent) => Promise<void>

class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map()

  subscribe(eventType: EventType, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType)!.push(handler)
  }

  async publish(event: DomainEvent) {
    const handlers = this.handlers.get(event.type) || []
    
    // Fire and forget with error logging
    // In production: use Inngest or Trigger.dev
    Promise.all(
      handlers.map(handler =>
        handler(event).catch(err => {
          console.error(
            `[EventBus] Handler failed for ${event.type}:`,
            err
          )
          // Log to monitoring service in production
        })
      )
    )
  }
}

export const eventBus = new EventBus()

// ============================================
// EVENT HANDLERS (to be registered)
// ============================================

/**
 * When video is completed:
 * - Update streak
 * - Log activity
 * - Update playlist progress
 * - Update analytics
 * - Trigger notification
 * - Check for achievements
 */
export async function handleVideoCompleted(event: DomainEvent) {
  const { userId, videoId, playlistId } = event.data

  // These all happen independently now
  // Can be moved to background jobs with Inngest
  
  // 1. Update streak
  // await streakService.recordActivity(userId)
  
  // 2. Update playlist progress
  // await enrollmentRepository.updateProgress(userId, playlistId, { ... })
  
  // 3. Update analytics
  // await analyticsRepository.incrementCompletion(playlistId)
  
  // 4. Check if playlist completed
  // if (allVideosCompleted) await handlePlaylistCompleted(...)
}

/**
 * When user enrolls in playlist:
 * - Send welcome email
 * - Record activity
 * - Update analytics
 * - Recommend similar playlists
 */
export async function handlePlaylistEnrolled(event: DomainEvent) {
  const { userId, playlistId } = event.data

  // 1. Send email
  // await emailService.sendWelcomeEmail(userId)
  
  // 2. Update analytics
  // await analyticsRepository.incrementEnrollment(playlistId)
  
  // 3. Queue recommendations
  // await recommendationQueue.enqueue({ userId, playlistId })
}

/**
 * When bookmark is added:
 * - Track for recommendations
 * - Update user interests
 * - Notify creator (if shared)
 */
export async function handleBookmarkAdded(event: DomainEvent) {
  const { userId, videoId, playlistId } = event.data

  // 1. Update user interests/tags
  // await userInterestService.recordInteraction(userId, videoId)
  
  // 2. Queue for analytics pipeline
  // await analyticsQueue.enqueue({ event })
}

// ============================================
// EVENT REGISTRATION
// Happens at app startup
// ============================================

export function registerEventHandlers() {
  eventBus.subscribe(EventType.VIDEO_COMPLETED, handleVideoCompleted)
  eventBus.subscribe(EventType.PLAYLIST_ENROLLED, handlePlaylistEnrolled)
  eventBus.subscribe(EventType.BOOKMARK_ADDED, handleBookmarkAdded)
  
  console.log("[EventBus] Handlers registered")
}

// ============================================
// EVENT EMITTING HELPER
// ============================================

export async function emitEvent(
  type: EventType,
  userId: string,
  data: Record<string, any>
) {
  const event: DomainEvent = {
    type,
    userId,
    data,
    timestamp: new Date(),
    correlationId: generateCorrelationId(),
  }

  await eventBus.publish(event)
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
