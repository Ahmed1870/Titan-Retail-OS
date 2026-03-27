import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServerClient();
  const { data: tenant } = await supabase.from('tenants')
    .select('id, store_name, logo_url').eq('slug', params.slug).eq('plan_status', 'active').single();
  if (!tenant) return NextResponse.json({ error: 'Store not found or inactive' }, { status: 404 });
  const { searchParams } = new URL(req.url);
  let query = supabase.from('products')
    .select('id, name, description, price, tax_rate, images, category, inventory(quantity)')
    .eq('tenant_id', tenant.id).eq('is_active', true).is('deleted_at', null);
  if (searchParams.get('category')) query = query.eq('category', searchParams.get('category')!);
  if (searchParams.get('q')) query = query.ilike('name', `%${searchParams.get('q')}%`);
  const { data } = await query;
  return NextResponse.json({ store: tenant, products: data ?? [] });
}
