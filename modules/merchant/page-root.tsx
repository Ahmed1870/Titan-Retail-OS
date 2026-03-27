import { getMerchantContextAction } from '@/modules/merchant/actions/auth';
import MerchantDashboardClient from '@/modules/merchant/components/MerchantDashboardClient';
import { redirect } from 'next/navigation';

export default async function MerchantPageRoot() {
  const { data: context, error } = await getMerchantContextAction();

  // 1. حماية ضد التسريب (Fallback Protection)
  if (error === 'UNAUTHORIZED' || error === 'FORBIDDEN') {
    redirect('/auth/login');
  }

  if (error === 'NO_TENANT' || !context) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-300 font-sans">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-red-900/50 shadow-2xl max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-2">Critical Error</h1>
          <p>No store is associated with this account. Please contact system administrator.</p>
        </div>
      </div>
    );
  }

  // 2. تطبيق التجميد العميق (Deep-Freeze)
  if (context.planStatus !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-slate-300 font-sans">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md">
          <div className="text-6xl mb-4 text-emerald-500 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-2">Store Pending Activation</h1>
          <p className="mb-6 leading-relaxed text-sm">
            Your store <strong className="text-emerald-400">"{context.storeName}"</strong> is currently <span className="uppercase text-xs bg-slate-800 px-2 py-1 rounded ml-1">{context.planStatus}</span>.<br/>
            We are reviewing your subscription request.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201019672878'}?text=${encodeURIComponent(`Hello Titan Support, I need to activate my store: ${context.storeName}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Contact Support via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // 3. السماح بالمرور (Unfrozen - Active Merchant)
  return <MerchantDashboardClient tenantId={context.tenantId} storeName={context.storeName} />;
}
