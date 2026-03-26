import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('orders')
    .select('*, tenants(store_name, slug)')
    .eq('courier_id', user?.id)
    .in('status', ['assigned', 'confirmed'])

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
}
