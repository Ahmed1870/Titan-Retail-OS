import { createClient } from '@/lib/supabase/server';

export async function getWalletDetailsAction() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return { error: 'UNAUTHORIZED' };

  // جلب بيانات المستخدم لمعرفة الـ tenant_id
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', session.user.id)
    .single();

  if (!userData?.tenant_id) return { error: 'NO_TENANT_FOUND' };

  // جلب المحفظة بناءً على الـ tenant_id (كما هو في السكيما v2.0)
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('tenant_id', userData.tenant_id)
    .single();

  if (walletError) return { error: walletError.message };

  // جلب آخر 10 عمليات
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('tenant_id', userData.tenant_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return { balance: wallet.balance, transactions };
}
