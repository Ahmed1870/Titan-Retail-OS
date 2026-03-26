import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
}
