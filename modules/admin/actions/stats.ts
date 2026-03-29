import { createClient } from '@/lib/supabase/server';

export async function getPlatformStatsAction() {
  const supabase = createClient();

  // جلب إجمالي أرباح المنصة بناءً على السكيما v2.0 (transactions table + platform_fee type)
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'platform_fee');

  if (error) {
    console.error('Error fetching platform earnings:', error);
    return { error: error.message };
  }

  const totalEarnings = data.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return { totalEarnings };
}
