import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { videoService } from "@/lib/services/refactored"
import { successResponse, errorResponse } from "@/lib/api-response"
import type { ApiResponse } from "@/lib/api-errors"

// ============================================
// POST /api/videos/[id]/complete
// Toggle video completion
// ============================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    const { id: videoId } = await params

    const video = await videoService.completeVideo(userId, videoId)

    return NextResponse.json(
      successResponse({ video, isCompleted: video.isCompleted }),
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[POST /api/videos/[id]/complete]", error)

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      errorResponse(error.message || "Failed to toggle video completion"),
      { status: 500 }
    )
  }
}
