import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PROJECT_LINK_FINAL || 'https://uyglhsoafegkickjfoik.supabase.co'
const supabaseAnonKey = process.env.PROJECT_KEY_PUBLIC || ''

// تصدير الكلاينت الجاهز
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// تصدير الوظيفة نفسها لحل مشاكل الـ Hooks
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)
