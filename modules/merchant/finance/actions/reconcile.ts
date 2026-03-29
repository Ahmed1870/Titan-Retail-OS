import { createClient } from '@/lib/supabase/server';

export async function getFinancialDiscrepancies(tenantId: string) {
  const supabase = createClient();

  // 1. جلب مجموع الطلبات الناجحة (Expected Cash)
  const { data: ordersSum } = await supabase
    .from('orders')
    .select('total')
    .eq('tenant_id', tenantId)
    .eq('status', 'delivered');

  const expectedTotal = ordersSum?.reduce((acc, curr) => acc + curr.total, 0) || 0;

  // 2. جلب مجموع الحركات المالية الفعلية (Actual Cash)
  const { data: transactionsSum } = await supabase
    .from('transactions')
    .select('amount')
    .eq('tenant_id', tenantId)
    .eq('type', 'sale');

  const actualTotal = transactionsSum?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return {
    expected: expectedTotal,
    actual: actualTotal,
    discrepancy: expectedTotal - actualTotal,
    status: expectedTotal === actualTotal ? 'MATCHED' : 'ALERT'
  };
}
