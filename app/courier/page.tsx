export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import CourierDashboardClient from '@/components/courier/CourierDashboardClient';

export default async function CourierPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');
  const { data: user } = await supabase.from('users').select('*, tenants(*)').eq('id', session.user.id).single();
  if (!user || user.role !== 'courier') redirect('/');
  return <CourierDashboardClient user={user} />;
}
