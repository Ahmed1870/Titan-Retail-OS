import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { data: tenant } = await supabaseAdmin.from('tenants').select('id').eq('slug', params.slug).single();
  const { data: products } = await supabaseAdmin.from('products').select('*').eq('tenant_id', tenant?.id);
  return NextResponse.json(products);
}
