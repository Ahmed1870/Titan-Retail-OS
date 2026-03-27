export async function validateCoupon(code: string, tenantId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('tenant_id', tenantId)
    .single();
    
  if (error || new Date(data.expiry_date) < new Date()) return { valid: false };
  return { valid: true, discount: data.discount_percent };
}
