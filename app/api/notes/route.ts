import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { noteService } from "@/lib/services/refactored"
import { CreateNoteSchema } from "@/lib/validators"
import { errorResponse, successResponse } from "@/lib/api-response"
import { parseZodError } from "@/lib/api-errors"
import { serializeNotes } from "@/lib/api-serializers"

export async function GET() {
  try {
    const userId = await verifyAuth()
    const notes = await noteService.getNotes(userId)

    return NextResponse.json(successResponse(serializeNotes(notes)), { status: 200 })
  } catch (error: any) {
    console.error("[GET /api/notes]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to fetch notes"), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth()
    const body = await req.json()
    const data = CreateNoteSchema.parse(body)

    const note = await noteService.createNote(userId, data)
    return NextResponse.json(successResponse(note), { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/notes]", error)
    if (error.name === "ZodError") {
      const validationError = parseZodError(error)
      return NextResponse.json({ success: false, error: validationError.message, code: validationError.code, details: validationError.details }, { status: 400 })
    }
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to create note"), { status: 500 })
  }
}