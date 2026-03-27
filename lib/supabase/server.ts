import { createServerClient as supabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// استخدام الأسماء المخصصة اللي إنت ضفتها في Vercel
const SUPABASE_URL = process.env.PROJECT_LINK_FINAL
const SUPABASE_ANON_KEY = process.env.PROJECT_KEY_PUBLIC
const SUPABASE_SERVICE_ROLE = process.env.PROJECT_KEY_PRIVATE

export function createClient() {
  const cookieStore = cookies()
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase Environment Variables");
  }

  return supabaseServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch (error) {}
        },
      },
    }
  )
}

export const createServerClient = createClient;

export function createServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("Missing Supabase Service Role Key");
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
}
