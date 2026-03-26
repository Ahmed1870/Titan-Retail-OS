import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/errors'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminCheck } = await supabase.from('users').select('role').eq('id', user?.id).single()
  if (adminCheck?.role !== 'admin') throw new AuthError("FORBIDDEN")

  // Aggregate Platform Revenue (Section 12 & 14)
  const { data: walletData } = await supabase.from('wallets').select('total_earned')
  const totalPlatformVolume = walletData?.reduce((sum, w) => sum + Number(w.total_earned), 0) || 0

  // Tenant Growth
  const { count: totalTenants } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
  const { count: activeTenants } = await supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('plan_status', 'active')

  return NextResponse.json({
    metrics: {
      totalPlatformVolume,
      totalTenants,
      activeTenants,
      conversionRate: totalTenants ? (activeTenants! / totalTenants!) * 100 : 0
    },
    timestamp: new Date().toISOString()
  })
}
