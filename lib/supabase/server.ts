// lib/supabase/server.ts
// Server-side clients (Route Handlers, Server Components)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// For Route Handlers — uses user's JWT session
export const createServerClient = () =>
  createRouteHandlerClient({ cookies });

// Service role — bypasses RLS, server-only, NEVER expose to client
export const createServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
