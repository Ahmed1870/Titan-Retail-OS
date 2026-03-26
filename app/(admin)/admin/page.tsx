import StatCard from '@/components/ui/StatCard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { count: tenants } = await supabase.from('tenants').select('*', { count: 'exact', head: true });
  const { data: revenue } = await supabase.from('transactions').select('amount').eq('type', 'platform_fee');
  const totalRev = revenue?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-10">
      <header className="border-b border-[#00ff88]/20 pb-4">
        <h2 className="text-4xl font-black uppercase italic tracking-widest">System_Overview</h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total_Tenants" value={tenants || 0} color="emerald" />
        <StatCard title="Platform_Revenue" value={`${totalRev} EGP`} color="emerald" />
        <StatCard title="System_Status" value="OPERATIONAL" color="emerald" />
      </div>
    </div>
  );
}
