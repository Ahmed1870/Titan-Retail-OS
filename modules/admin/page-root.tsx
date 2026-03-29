'use client'
import { getPendingTenantsAction } from '@/modules/admin/actions/tenants';
import DashboardClient from '@/modules/admin/components/DashboardClient';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPageRoot() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/auth/login');

  // التأكد من الصلاحية قبل جلب البيانات الحساسة
  const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (user?.role !== 'admin') redirect('/');

  const { data: pendingTenants, error } = await getPendingTenantsAction();

  return (
    <div className="p-6 bg-[#080c14] min-h-screen text-slate-200">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">System Control Panel</h1>
        <p className="text-slate-400">Titan Retail OS | Global Management</p>
      </header>

      <section className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
            Pending Activations ({pendingTenants?.length || 0})
          </h2>
          
          <DashboardClient initialTenants={pendingTenants || []} />
        </div>
      </section>
    </div>
  );
}
