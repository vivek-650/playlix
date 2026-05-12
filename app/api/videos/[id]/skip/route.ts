import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { videoService } from "@/lib/services/refactored"
import { errorResponse, successResponse } from "@/lib/api-response"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyAuth()
    const { id } = await params
    const video = await videoService.skipVideo(userId, id)
    return NextResponse.json(successResponse({ video, isSkipped: video.isSkipped }), { status: 200 })
  } catch (error: any) {
    console.error("[POST /api/videos/:id/skip]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to toggle video skip"), { status: 500 })
  }
}