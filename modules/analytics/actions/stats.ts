import { createClient } from '@/lib/supabase/server';

export async function getTenantAnalyticsAction(tenantId: string, days: number = 7) {
  const supabase = createClient();
  
  // جلب إحصائيات آخر X يوم
  const { data, error } = await supabase
    .from('tenant_daily_stats')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('stats_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('stats_date', { ascending: true });

  if (error) return { error: error.message };

  // حساب الإجماليات السريعة (Summary)
  const summary = data.reduce((acc, curr) => ({
    totalSales: acc.totalSales + Number(curr.total_sales),
    totalOrders: acc.totalOrders + curr.order_count,
    totalProfit: acc.totalProfit + Number(curr.net_profit)
  }), { totalSales: 0, totalOrders: 0, totalProfit: 0 });

  return { data, summary };
}
