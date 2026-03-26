import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const supabase = createClient()

  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', params.slug).single()
  if (!tenant) return NextResponse.json({ error: 'STORE_NOT_FOUND' }, { status: 404 })

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .ilike('name', `%${q}%`)
    .is('deleted_at', null)

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
}
