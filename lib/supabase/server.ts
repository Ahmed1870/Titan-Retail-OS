import { createCookieClientServer } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const supabase = createCookieClientServer({ cookies });

// استخدام الـ Private Key للعمليات الحساسة (Admin Logic)
export const supabaseAdmin = createCookieClientServer({ 
  cookies,
  options: {
    global: {
      headers: { 'Authorization': `Bearer ${process.env.PROJECT_KEY_PRIVATE}` }
    }
  }
});
