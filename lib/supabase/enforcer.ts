import { supabase } from './server'

export const enforceTenant = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', userId)
    .single()
    
  if (error || !data) throw new Error("Unauthorized Access - No Tenant Found");
  return data; // بيرجع الـ tenant_id والـ role
}
