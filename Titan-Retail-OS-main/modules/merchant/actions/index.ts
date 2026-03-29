import { InventoryService } from '@/services/inventoryService'
import { OrderService } from '@/services/orderService'

// --- Actions المبيعات والمخزن الموحدة ---

export const handleCreateOrder = async (formData: any, tenantId: string, userId: string) => {
  try {
    // 1. إنشاء الطلب والعملية المالية (Atomic)
    const { order, error } = await OrderService.createOrder(formData, tenantId);
    if (error) throw error;

    // 2. تحديث المخزون أوتوماتيكياً لكل منتج في الطلب
    for (const item of formData.items) {
      await InventoryService.adjustStock(
        item.product_id, 
        -item.quantity, 
        `بيع طلب رقم ${order.id}`, 
        tenantId, 
        userId
      );
    }

    return { success: true, orderId: order.id };
  } catch (err: any) {
    console.error('Order Action Error:', err.message);
    return { success: false, error: err.message };
  }
};

export const getMerchantStats = async (tenantId: string) => {
  // استدعاء الـ View اللي صلحناه في الداتابيز
  const { data, error } = await supabase
    .from('platform_global_metrics')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();
    
  return { data, error };
};
