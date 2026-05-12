import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { playlistService } from "@/lib/services/refactored"
import { successResponse, errorResponse } from "@/lib/api-response"
import { z } from "zod"
import type { ApiResponse } from "@/lib/api-errors"

const VisibilitySchema = z.object({
  visibility: z.enum(["PRIVATE", "PUBLIC", "UNLISTED"]),
})

// ============================================
// POST /api/playlists/[id]/visibility
// Update playlist visibility (owner only)
// ============================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    const body = await req.json()
    const { id } = await params

    const { visibility } = VisibilitySchema.parse(body)

    const updated = await playlistService.updatePlaylistVisibility(
      userId,
      id,
      visibility
    )

    return NextResponse.json(successResponse(updated), { status: 200 })
  } catch (error: any) {
    console.error("[POST /api/playlists/:id/visibility]", error)

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      errorResponse(error.message || "Failed to update playlist visibility"),
      { status: 500 }
    )
  }
}
