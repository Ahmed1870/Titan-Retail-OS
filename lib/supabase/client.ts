import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    'https://uyglhsoafegkickjfoik.supabase.co',
    process.env.PROJECT_KEY_PUBLIC!
  )
