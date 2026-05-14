import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"
import { playlistService } from "@/lib/services/refactored"
import { errorResponse } from "@/lib/api-response"
import type { ApiResponse } from "@/lib/api-errors"

// ============================================
// GET /api/community/playlists
// Get all public playlists for the community section
// ============================================

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

    const skip = (page - 1) * limit

    const playlists = await playlistService.getPublicPlaylists(limit, skip)

    let enrolledIds = new Set<string>()
    try {
      const userId = await verifyAuth()
      const playlistIds = playlists.map((playlist) => playlist.id)
      const enrollments = await prisma.playlistEnrollment.findMany({
        where: { userId, playlistId: { in: playlistIds } },
        select: { playlistId: true },
      })
      enrolledIds = new Set(enrollments.map((enrollment) => enrollment.playlistId))
    } catch {
      enrolledIds = new Set()
    }

    // Get total count for pagination
    const total = await prisma.playlist.count({
      where: { visibility: "PUBLIC", deletedAt: null, status: "READY" },
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        success: true,
        data: playlists.map((playlist) => ({
          ...playlist,
          isEnrolled: enrolledIds.has(playlist.id),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[GET /api/community/playlists]", error)

    return NextResponse.json(
      errorResponse(error.message || "Failed to fetch public playlists"),
      { status: 500 }
    )
  }
}
