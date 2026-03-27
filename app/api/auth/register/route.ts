export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/utils';
import { referralService } from '@/services';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  phone: z.string().optional(),
  store_name: z.string().min(2),
  referral_code: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!await rateLimit(`register_${ip}`, 5, 60 * 60 * 1000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { email, password, full_name, phone, store_name, referral_code } = parsed.data;
  const supabase = createRouteHandlerClient({ cookies });

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const userId = authData.user!.id;
  const slug = store_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + userId.slice(0, 6);

  const { data: tenant, error: tErr } = await supabase
    .from('tenants').insert({ store_name, slug, owner_id: userId }).select().single();
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 });

  await Promise.all([
    supabase.from('users').insert({ id: userId, tenant_id: tenant.id, role: 'merchant', full_name, phone: phone ?? null, email }),
    supabase.from('wallets').insert({ tenant_id: tenant.id }),
  ]);

  if (referral_code) {
    try { await referralService.applyReferralCode(tenant.id, referral_code); } catch {}
  }

  return NextResponse.json({ userId, tenantId: tenant.id, slug }, { status: 201 });
}
