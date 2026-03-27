import { createServiceClient } from '@/lib/supabase/server';
import { ServiceError } from '@/services/errors';
import type { Inventory, InventoryLog } from '@/types';

export const inventoryService = {
  async getStock(tenantId: string, productId?: string): Promise<Inventory[]> {
    const supabase = createServiceClient();
    let query = supabase
      .from('inventory')
      .select('*, products(name, sku, images, is_active)')
      .eq('tenant_id', tenantId)
      .is('products.deleted_at', null)
      .order('quantity', { ascending: true });

    if (productId) query = query.eq('product_id', productId);
    const { data, error } = await query;
    if (error) throw new ServiceError('INVENTORY_FETCH_FAILED', error.message);
    return (data ?? []) as Inventory[];
  },

  async getLowStockCount(tenantId: string): Promise<number> {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .filter('quantity', 'lte', 'low_stock_threshold');

    if (error) return 0;
    return count ?? 0;
  },

  async adjustStock(payload: {
    tenantId: string;
    productId: string;
    delta: number;
    reason: string;
    performedBy: string;
  }) {
    const supabase = createServiceClient();
    const { data: inv, error: fetchErr } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('tenant_id', payload.tenantId)
      .eq('product_id', payload.productId)
      .single();

    if (fetchErr || !inv) throw new ServiceError('INVENTORY_NOT_FOUND', 'Inventory record not found');

    const newQty = inv.quantity + payload.delta;
    if (newQty < 0) throw new ServiceError('INSUFFICIENT_STOCK', 'Stock cannot go negative');

    const { error: updateErr } = await supabase
      .from('inventory')
      .update({ quantity: newQty })
      .eq('product_id', payload.productId)
      .eq('tenant_id', payload.tenantId);

    if (updateErr) throw new ServiceError('INVENTORY_UPDATE_FAILED', updateErr.message);

    await supabase.from('inventory_logs').insert({
      tenant_id: payload.tenantId,
      product_id: payload.productId,
      delta: payload.delta,
      previous_qty: inv.quantity,
      new_qty: newQty,
      reason: payload.reason,
      performed_by: payload.performedBy,
    });

    return { previous: inv.quantity, new: newQty };
  }
};
