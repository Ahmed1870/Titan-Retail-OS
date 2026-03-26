import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session?.user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/login');

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#00ff88] font-mono">
      <aside className="w-64 border-r border-[#00ff88]/20 bg-[#080808] p-6 shadow-[5px_0_20px_rgba(0,255,136,0.05)]">
        <h1 className="text-2xl font-black italic uppercase mb-12 tracking-tighter">Titan_Admin</h1>
        <nav className="space-y-4">
          {['Tenants', 'Subscriptions', 'Analytics', 'Settings'].map((item) => (
            <a key={item} href={`/admin/${item.toLowerCase()}`} className="block p-3 border border-transparent hover:border-[#00ff88]/40 hover:bg-[#00ff88]/5 transition-all uppercase italic text-sm">
              // {item}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
