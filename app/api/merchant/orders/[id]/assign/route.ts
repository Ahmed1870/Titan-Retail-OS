import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { courier_id } = await req.json()
  const { error } = await supabase.from('orders').update({ courier_id, status: 'assigned' }).eq('id', params.id)
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true })
}
