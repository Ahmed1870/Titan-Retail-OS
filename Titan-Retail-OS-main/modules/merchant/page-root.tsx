"use client";
import { getMerchantContextAction } from '@/modules/merchant/actions/auth';

export default async function MerchantRootLayout({ children }: { children: React.ReactNode }) {
  const context = await getMerchantContextAction();
  
  if (!context.tenant) {
    return <div>Unauthorized or No Tenant Found</div>;
  }

  return (
    <div className="merchant-layout">
      {children}
    </div>
  );
}
