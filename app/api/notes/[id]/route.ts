import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"
import { noteService } from "@/lib/services/refactored"
import { UpdateNoteSchema } from "@/lib/validators"
import { errorResponse, successResponse } from "@/lib/api-response"
import { parseZodError } from "@/lib/api-errors"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyAuth()
    const body = await req.json()
    const data = UpdateNoteSchema.parse(body)
    const { id } = await params

    const note = await noteService.updateNote(userId, id, data)
    return NextResponse.json(successResponse(note), { status: 200 })
  } catch (error: any) {
    console.error("[PUT /api/notes/:id]", error)
    if (error.name === "ZodError") {
      const validationError = parseZodError(error)
      return NextResponse.json({ success: false, error: validationError.message, code: validationError.code, details: validationError.details }, { status: 400 })
    }
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to update note"), { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyAuth()
    const { id } = await params
    const note = await noteService.deleteNote(userId, id)
    return NextResponse.json(successResponse(note), { status: 200 })
  } catch (error: any) {
    console.error("[DELETE /api/notes/:id]", error)
    if (error.statusCode) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json(errorResponse(error.message || "Failed to delete note"), { status: 500 })
  }
}