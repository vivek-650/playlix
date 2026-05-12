import type { NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/api-errors"

// ============================================
// API RESPONSE FORMATTERS
// ============================================

export function successResponse<T>(
  data: T,
  status = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

export function errorResponse(
  error: string | Error,
  code = "INTERNAL_SERVER_ERROR",
  status = 500
): ApiResponse {
  const message = error instanceof Error ? error.message : error
  return {
    success: false,
    error: message,
    code,
  }
}

export function createdResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize)
  return {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages,
    },
  }
}
