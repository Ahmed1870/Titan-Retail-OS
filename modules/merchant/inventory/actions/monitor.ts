import { createClient } from '@/lib/supabase/server';

export async function getLowStockProducts(tenantId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('name, stock, low_stock_threshold')
    .eq('tenant_id', tenantId)
    .filter('stock', 'lte', 'low_stock_threshold');
  return data;
}
