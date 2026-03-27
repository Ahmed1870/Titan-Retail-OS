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
    "https://uyglhsoafegkickjfoik.supabase.co"!,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Z2xoc29hZmVna2lja2pmb2lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2NzU4NSwiZXhwIjoyMDkwMTQzNTg1fQ.og4sbw_XZGni-_vWdJw4PPSaEF59dnmfDn3ZawYvFGs"!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
