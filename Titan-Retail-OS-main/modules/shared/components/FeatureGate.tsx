"use client";
import { usePlanAccess } from '@/modules/auth/hooks/usePlanAccess';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requiredPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  currentPlan: string;
  fallback?: ReactNode;
}

export const FeatureGate = ({ children, requiredPlan, currentPlan, fallback }: Props) => {
  const { canAccess } = usePlanAccess(currentPlan);

  if (canAccess(requiredPlan)) return <>{children}</>;

  return fallback || (
    <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center">
      <span className="text-4xl mb-4 block">🔒</span>
      <h3 className="text-lg font-bold">هذه الميزة غير متاحة في باقتك الحالية</h3>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm">ترقية الآن</button>
    </div>
  );
};
