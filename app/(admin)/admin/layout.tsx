import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/login');

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#00ff88] font-mono">
      <aside className="w-64 border-r border-[#00ff88]/20 bg-[#080808] p-6 hidden md:block">
        <h1 className="text-xl font-black italic uppercase mb-12 tracking-tighter text-white">
          Titan <span className="text-[#00ff88]">Control</span>
        </h1>
        <nav className="space-y-2">
          {[
            { name: 'Overview', path: '/admin' },
            { name: 'Tenants', path: '/admin/tenants' },
            { name: 'Subscriptions', path: '/admin/subscriptions' },
            { name: 'Analytics', path: '/admin/analytics' }
          ].map((item) => (
            <a key={item.name} href={item.path} className="block p-3 border border-transparent hover:border-[#00ff88]/40 hover:bg-[#00ff88]/5 transition-all uppercase text-xs">
              [ {item.name} ]
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {children}
      </main>
    </div>
  );
}
