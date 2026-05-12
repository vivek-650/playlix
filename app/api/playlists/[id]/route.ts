import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { playlistService } from "@/lib/services/refactored"
import { successResponse, errorResponse } from "@/lib/api-response"
import type { ApiResponse } from "@/lib/api-errors"
import { serializePlaylist } from "@/lib/api-serializers"

// ============================================
// GET /api/playlists/[id]
// Get single playlist (for enrolled users or owners)
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    const { id: playlistId } = await params

    const playlist = await playlistService.getPlaylist(playlistId, userId)

    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    return NextResponse.json(successResponse(serializePlaylist(playlist)), { status: 200 })
  } catch (error: any) {
    console.error("[GET /api/playlists/[id]]", error)

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      errorResponse(error.message || "Failed to fetch playlist"),
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    const { id } = await params
    const deleted = await playlistService.deletePlaylist(userId, id)

    return NextResponse.json(successResponse(deleted), { status: 200 })
  } catch (error: any) {
    console.error("[DELETE /api/playlists/[id]]", error)

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      errorResponse(error.message || "Failed to delete playlist"),
      { status: 500 }
    )
  }
}
