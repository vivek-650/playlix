import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { activityService } from "@/lib/services/refactored"
import { errorResponse, successResponse } from "@/lib/api-response"
import { serializeActivities } from "@/lib/api-serializers"

export async function GET() {
  try {
    const userId = await verifyAuth()
    const activity = await activityService.getUserActivity(userId, 20)
    return NextResponse.json(successResponse(serializeActivities(activity)), { status: 200 })
  } catch (error: any) {
    console.error("[GET /api/activity]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to fetch activity"), { status: 500 })
  }
}