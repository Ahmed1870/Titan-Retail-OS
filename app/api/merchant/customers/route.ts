import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DatabaseError } from '@/lib/errors'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: prof } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()

  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, phone, email, total_orders, last_order_at')
    .eq('tenant_id', prof?.tenant_id)
    .order('last_order_at', { ascending: false })

  if (error) throw new DatabaseError(error.message)
  return NextResponse.json(data)
}
