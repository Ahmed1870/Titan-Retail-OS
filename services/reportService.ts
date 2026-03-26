import { createClient } from '@/lib/supabase/server'
import { DatabaseError } from '@/lib/errors'

export const reportService = {
  async getRevenueReport(tenantId: string, startDate: string, endDate: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at, status')
      .eq('tenant_id', tenantId)
      .eq('status', 'delivered')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) throw new DatabaseError(error.message)

    const totalRevenue = data.reduce((sum, order) => sum + Number(order.total), 0)
    const orderCount = data.length

    return {
      totalRevenue,
      orderCount,
      averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      data
    }
  }
}
