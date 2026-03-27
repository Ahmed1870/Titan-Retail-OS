// lib/supabase/client.ts
// Browser-side Supabase client (for React components)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// @ts-ignore
import type { Database } from '@/types/supabase';

export const createClient = () => createClientComponentClient<Database>();
