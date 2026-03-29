import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const schemaHelper = {
  // إصلاح خطأ z.record
  attributes: z.record(z.string(), z.unknown()).optional(),
  
  // إصلاح الوصول للخطأ في Zod
  formatError: (error: z.ZodError) => {
    return error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
  }
}
