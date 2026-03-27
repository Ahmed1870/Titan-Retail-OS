import { productService, inventoryService } from '@/services';
import { verifyMerchant } from './auth';

export async function getProductsAction(params: any = {}) {
  const { tenant } = await verifyMerchant();
  return await productService.list(tenant.id, params);
}

export async function createProductAction(data: any) {
  const { userData, tenant } = await verifyMerchant();
  return await productService.create(tenant.id, userData.id, data);
}

export async function updateProductAction(id: string, updates: any) {
  const { userData, tenant } = await verifyMerchant();
  return await productService.update(tenant.id, id, userData.id, updates);
}

export async function deleteProductAction(id: string) {
  const { userData, tenant } = await verifyMerchant();
  return await productService.softDelete(tenant.id, id, userData.id);
}

export async function getStockAction() {
  const { tenant } = await verifyMerchant();
  return await inventoryService.getStock(tenant.id);
}

export async function adjustStockAction(data: { product_id: string, delta: number, reason: string }) {
  const { userData, tenant } = await verifyMerchant();
  return await inventoryService.adjustStock({
    tenantId: tenant.id,
    productId: data.product_id,
    delta: data.delta,
    reason: data.reason,
    performedBy: userData.id
  });
}
