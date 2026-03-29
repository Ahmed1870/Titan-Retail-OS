export class AppError extends Error {
  constructor(public message: string, public code: string, public status: number = 400) {
    super(message);
  }
}

export const handleApiError = (error: any) => {
  console.error(`[Error ${error.code}]: `, error.message);
  return {
    success: false,
    message: error.message || 'حدث خطأ غير متوقع',
    code: error.code || 'UNKNOWN_ERROR'
  };
};
