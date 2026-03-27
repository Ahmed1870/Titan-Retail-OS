// services/inventoryService.ts
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
      .order('updated_at', { ascending: false });

    if (productId) query = query.eq('product_id', productId);
    const { data, error } = await query;
    if (error) throw new ServiceError('INVENTORY_FETCH_FAILED', error.message);
    return (data ?? []) as Inventory[];
  },

  async getLowStockAlerts(tenantId: string): Promise<Inventory[]> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('*, products(name, sku, images)')
      .eq('tenant_id', tenantId)
      .filter('quantity', 'lte', 'low_stock_threshold');

    if (error) throw new ServiceError('LOW_STOCK_FETCH_FAILED', error.message);
    return (data ?? []) as Inventory[];
  },

  async getLogs(tenantId: string, productId?: string, limit: number = 50): Promise<InventoryLog[]> {
    const supabase = createServiceClient();
    let query = supabase
      .from('inventory_logs')
      .select('*, products(name, sku)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) query = query.eq('product_id', productId);
    const { data, error } = await query;
    if (error) throw new ServiceError('INV_LOG_FETCH_FAILED', error.message);
    return (data ?? []) as InventoryLog[];
  },

  async adjustStock(payload: {
    tenantId: string;
    productId: string;
    delta: number;
    reason: string;
    performedBy: string;
  }): Promise<{ previous: number; new: number }> {
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
      .eq('tenant_id', payload.tenantId)
      .eq('product_id', payload.productId);

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
  },

  async setThreshold(tenantId: string, productId: string, threshold: number) {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('inventory')
      .update({ low_stock_threshold: threshold })
      .eq('tenant_id', tenantId)
      .eq('product_id', productId);

    if (error) throw new ServiceError('THRESHOLD_UPDATE_FAILED', error.message);
  },

  async getLowStockCount(tenantId: string): Promise<number> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('inventory')
      .select('id')
      .eq('tenant_id', tenantId);

    // Count items where quantity <= threshold
    const { data: allInv } = await supabase
      .from('inventory')
      .select('quantity, low_stock_threshold')
      .eq('tenant_id', tenantId);

    return (allInv ?? []).filter(i => i.quantity <= i.low_stock_threshold).length;
  },
};
