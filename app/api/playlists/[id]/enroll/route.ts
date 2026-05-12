import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { playlistService } from "@/lib/services/refactored"
import { errorResponse, successResponse } from "@/lib/api-response"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyAuth()
    const { id } = await params
    const enrollment = await playlistService.enrollPlaylist(userId, id)
    return NextResponse.json(successResponse(enrollment), { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/playlists/:id/enroll]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to enroll in playlist"), { status: 500 })
  }
}