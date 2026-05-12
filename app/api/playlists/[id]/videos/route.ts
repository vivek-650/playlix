import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { videoService } from "@/lib/services/refactored"
import { errorResponse, successResponse } from "@/lib/api-response"
import { CreateVideoSchema } from "@/lib/validators"
import { parseZodError } from "@/lib/api-errors"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyAuth()
    const body = await req.json()
    const videos = Array.isArray(body?.videos) ? body.videos : []
    const { id } = await params
    const validated = videos.map((video: unknown) => CreateVideoSchema.parse({ ...(video as object), playlistId: id }))

    const created = await videoService.createBatch(
      id,
      userId,
      validated.map((video) => ({
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
        position: video.position,
      }))
    )

    return NextResponse.json(successResponse(created), { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/playlists/:id/videos]", error)
    if (error.name === "ZodError") {
      const validationError = parseZodError(error)
      return NextResponse.json({ success: false, error: validationError.message, code: validationError.code, details: validationError.details }, { status: 400 })
    }
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to create videos"), { status: 500 })
  }
}