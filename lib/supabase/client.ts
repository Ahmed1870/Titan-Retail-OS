import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.PROJECT_LINK_FINAL!,
    process.env.PROJECT_KEY_PUBLIC!
  )
}

// التصدير الصحيح بدون تمرير متغيرات غير موجودة
export const supabase = createClient();
