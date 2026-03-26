import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DatabaseError } from '@/lib/errors'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()
  if (!profile?.tenant_id) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 404 })

  const { data, error } = await supabase
    .from('products')
    .select('*, inventory(quantity)')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new DatabaseError(error.message)
  return NextResponse.json(data)
}
