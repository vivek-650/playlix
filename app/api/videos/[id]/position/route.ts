import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { videoService } from "@/lib/services/refactored"
import { errorResponse, successResponse } from "@/lib/api-response"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyAuth()
    const { seconds } = await req.json()
    const { id } = await params
    const video = await videoService.savePosition(userId, id, Number(seconds) || 0)
    return NextResponse.json(successResponse(video), { status: 200 })
  } catch (error: any) {
    console.error("[POST /api/videos/:id/position]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to save position"), { status: 500 })
  }
}