import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uyglhsoafegkickjfoik.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// تصدير الكلاينت الجاهز
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// تصدير الوظيفة نفسها لحل مشاكل الـ Hooks
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)
