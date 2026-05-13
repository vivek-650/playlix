import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { userService } from "@/lib/services/refactored"
import { UpdateSettingsSchema } from "@/lib/validators"
import { errorResponse, successResponse } from "@/lib/api-response"
import { parseZodError } from "@/lib/api-errors"

export async function GET() {
  try {
    const userId = await verifyAuth()
    const settings = await userService.getSettings(userId)
    return NextResponse.json(
      successResponse(settings),
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=600, s-maxage=600",
        },
      }
    )
  } catch (error: any) {
    console.error("[GET /api/settings]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to fetch settings"), { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await verifyAuth()
    const body = await req.json()
    const data = UpdateSettingsSchema.parse(body)
    const settings = await userService.updateSettings(userId, data)
    return NextResponse.json(successResponse(settings), { status: 200 })
  } catch (error: any) {
    console.error("[PUT /api/settings]", error)
    if (error.name === "ZodError") {
      const validationError = parseZodError(error)
      return NextResponse.json({ success: false, error: validationError.message, code: validationError.code, details: validationError.details }, { status: 400 })
    }
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to update settings"), { status: 500 })
  }
}