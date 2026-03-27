import { createServerClient as supabaseSSR, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 1. الدالة الأساسية للمستخدمين (تتعامل مع الكوكيز والـ Session)
export const createClient = () => {
  const cookieStore = cookies()
  return supabaseSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { 
          try { cookieStore.set({ name, value, ...options }) } catch (e) {} 
        },
        remove(name: string, options: CookieOptions) { 
          try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} 
        },
      },
    }
  )
}

// 2. محول الـ Admin والـ Middleware (لحل مشكلة الـ 63 ملف)
export const createServerClient = createClient;

// 3. محول الـ Services (لحل مشكلة الـ 18 ملف - مع صلاحيات كاملة)
// ملاحظة: هنا نستخدم الـ SERVICE_ROLE_KEY لتجاوز الـ RLS في العمليات الخلفية
export const createServiceClient = () => {
  return supabaseSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // التأكد من وجود هذا المتغير في Vercel
    { cookies: {} } // السيرفس لا تحتاج كوكيز لأنها تعمل برمز برمجى
  )
}

// 4. دعم المدرسة القديمة (Route Handlers)
export const createRouteHandlerClient = ({ cookies }: { cookies: any }) => createClient();

export default createClient;
