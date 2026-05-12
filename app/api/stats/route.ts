import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { userService } from "@/lib/services/refactored"
import { errorResponse, successResponse } from "@/lib/api-response"
import { serializeStats } from "@/lib/api-serializers"

export async function GET() {
  try {
    const userId = await verifyAuth()
    const stats = await userService.getStats(userId)
    return NextResponse.json(successResponse(serializeStats(stats)), { status: 200 })
  } catch (error: any) {
    console.error("[GET /api/stats]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to fetch stats"), { status: 500 })
  }
}