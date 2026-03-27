import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.PROJECT_LINK_FINAL!,
    process.env.PROJECT_KEY_PUBLIC!
  )
