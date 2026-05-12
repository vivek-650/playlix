// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// Error Classes
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = "ApiError"
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
    }
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, "VALIDATION_ERROR", message, details)
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, "CONFLICT", message)
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_SERVER_ERROR", message)
  }
}

// ============================================
// Error Handling Utilities
// ============================================

export function handlePrismaError(error: any) {
  if (error.code === "P2002") {
    return new ConflictError(`Unique constraint violation: ${error.meta?.target?.join(", ")}`)
  }
  if (error.code === "P2025") {
    return new NotFoundError("Record")
  }
  if (error.code === "P2003") {
    return new ValidationError("Foreign key constraint failed")
  }
  return new InternalServerError(error.message)
}

export function parseZodError(error: any) {
  const issues = error.issues || []
  const details: Record<string, string> = {}

  for (const issue of issues) {
    const path = issue.path.join(".")
    details[path] = issue.message
  }

  return new ValidationError("Validation failed", details)
}
