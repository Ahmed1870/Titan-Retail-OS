import { usePlanAccess } from '../hooks/usePlanAccess'
import Link from 'next/link'

export const MerchantSidebar = ({ tenantId }: { tenantId: string }) => {
  const { canAccess, plan } = usePlanAccess(tenantId);

  const menuItems = [
    { name: 'الرئيسية', href: '/merchant/dashboard', requiredPlan: 'FREE' },
    { name: 'المبيعات (POS)', href: '/merchant/pos', requiredPlan: 'FREE' },
    { name: 'المخزن', href: '/merchant/inventory', requiredPlan: 'FREE' },
    { name: 'الديون (CRM)', href: '/merchant/crm', requiredPlan: 'PRO' },
    { name: 'التقارير المتقدمة', href: '/merchant/analytics', requiredPlan: 'ENTERPRISE' },
  ];

  return (
    <nav className="flex flex-col gap-2 p-4">
      {menuItems.map((item) => {
        const hasAccess = canAccess(item.requiredPlan);
        return (
          <Link 
            key={item.href} 
            href={hasAccess ? item.href : '#'}
            className={`p-2 rounded ${hasAccess ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
          >
            {item.name} {!hasAccess && '🔒'}
          </Link>
        );
      })}
    </nav>
  );
};
