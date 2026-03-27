import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');
  const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (user?.role !== 'admin') redirect('/');
  return <AdminDashboardClient userId={session.user.id} />;
}
