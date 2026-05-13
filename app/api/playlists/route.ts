import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { playlistService } from "@/lib/services/refactored"
import { successResponse, errorResponse } from "@/lib/api-response"
import { handlePrismaError, parseZodError } from "@/lib/api-errors"
import { CreatePlaylistSchema } from "@/lib/validators"
import type { ApiResponse } from "@/lib/api-errors"
import { serializePlaylists, serializePlaylist } from "@/lib/api-serializers"

// ============================================
// GET /api/playlists
// Get all user playlists
// ============================================

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    const playlists = await playlistService.getUserPlaylists(userId)

    return NextResponse.json(
      successResponse(serializePlaylists(playlists)),
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=120, s-maxage=120",
        },
      }
    )
  } catch (error: any) {
    console.error("[GET /api/playlists]", error)

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      errorResponse(error.message || "Failed to fetch playlists"),
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/playlists
// Create a new playlist
// ============================================

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    const body = await req.json()

    // Validate input
    const validatedData = CreatePlaylistSchema.parse(body)

    const playlist = await playlistService.createPlaylist(userId, validatedData)

    return NextResponse.json(successResponse(serializePlaylist(playlist)), { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/playlists]", error)

    if (error.name === "ZodError") {
      const validationError = parseZodError(error)
      return NextResponse.json(
        {
          success: false,
          error: validationError.message,
          code: validationError.code,
          details: validationError.details,
        },
        { status: 400 }
      )
    }

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Playlist already exists",
          code: "CONFLICT",
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      errorResponse(error.message || "Failed to create playlist"),
      { status: 500 }
    )
  }
}
