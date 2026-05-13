import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
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

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress || clerkUser?.primaryEmailAddress?.emailAddress

  if (!email) {
    throw new UnauthorizedError("User account not found")
  }

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName,
      avatarUrl: clerkUser?.imageUrl,
    },
    create: {
      clerkId: userId,
      email,
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName,
      avatarUrl: clerkUser?.imageUrl,
    },
    select: { id: true },
  })

  return user.id
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
