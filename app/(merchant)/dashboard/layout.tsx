'use client';
import { useNotifications } from '@/hooks/useNotifications';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  // تفعيل الإشعارات اللحظية للتاجر فور الدخول
  return (
    <div className="flex min-h-screen bg-[#080c14]">
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-4">
        <div className="text-xl font-black text-purple-500 mb-10">TITAN RETAIL</div>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="p-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">الرئيسية</a>
          <a href="/dashboard/products" className="p-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">المنتجات</a>
          <a href="/dashboard/orders" className="p-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">الطلبات</a>
          <a href="/dashboard/subscriptions" className="p-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">الاشتراك</a>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
