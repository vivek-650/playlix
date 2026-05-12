import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
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

    // Get total count for pagination
    const total = await prisma.playlist.count({
      where: { visibility: "PUBLIC", deletedAt: null, status: "READY" },
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        success: true,
        data: playlists,
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
