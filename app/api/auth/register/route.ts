import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  try {
    const { email, password, full_name, store_name, phone, referral_code } = await req.json()

    // الحصول على رابط الموقع الديناميكي (Production URL)
    const requestUrl = new URL(req.url);
    const siteUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // 1. Auth Signup مع Redirect صحيّر
    const { data: authData, error: authErr } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback`, // هذا هو الرابط اللي هيصلح الصفحة البيضاء
      }
    })
    if (authErr) throw authErr

    // ... باقي منطق الكريشن (Tenant, Public User, Referral) كما هو سليم ...
    // ... (لكن تأكد من دمج بقية المنطق هنا ليكون كاملاً) ...

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
