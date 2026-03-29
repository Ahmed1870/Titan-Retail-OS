import { createClient } from '@/lib/supabase/server';
export async function closeShiftAction(shiftId: string, actualCash: number) {
  const supabase = createClient();
  const { error } = await supabase.rpc('close_shift', { shift_id_param: shiftId, actual_cash: actualCash });
  return { success: !error };
}
