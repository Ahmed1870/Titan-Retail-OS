export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400, public code?: string) {
    super(message)
    this.name = 'AppError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthError'
  }
}

export const handleApiError = (error: any) => {
  console.error(`[SYSTEM_LOG] ${new Date().toISOString()}:`, error)
  const status = error.statusCode || 500
  return new Response(JSON.stringify({
    success: false,
    error: error.message || "Internal Server Error",
    code: error.code || "UNKNOWN_ERROR"
  }), { status, headers: { 'Content-Type': 'application/json' } })
}
