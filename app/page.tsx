import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!user) redirect('/auth/login');

  switch (user.role) {
    case 'admin': redirect('/admin');
    case 'merchant': redirect('/merchant');
    case 'courier': redirect('/courier');
    case 'customer': redirect('/store');
    default: redirect('/auth/login');
  }
}
