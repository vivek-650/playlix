import { auth } from "@clerk/nextjs/server"
import { UnauthorizedError } from "@/lib/api-errors"

// ============================================
// AUTH UTILITIES FOR API ROUTES
// ============================================

/**
 * Verify user authentication and return userId
 * Use in API routes
 */
export async function verifyAuth() {
  const { userId } = await auth()
  if (!userId) throw new UnauthorizedError("You must be logged in")
  return userId
}

/**
 * Middleware to protect API routes
 * Use in API route handlers
 */
export async function withAuth<T extends any[], R>(
  handler: (userId: string, ...args: T) => Promise<R>,
  ...args: T
): Promise<R> {
  const userId = await verifyAuth()
  return handler(userId, ...args)
}
