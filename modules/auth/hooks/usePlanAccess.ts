import { PLAN_LIMITS, PlanType } from '@/lib/config/plans';

export function usePlanAccess(currentPlan: PlanType) {
  const limits = PLAN_LIMITS[currentPlan];

  return {
    canAccessAnalytics: limits.can_access_analytics,
    canCustomBrand: limits.can_custom_brand,
    maxStaff: limits.max_staff,
    maxProducts: limits.max_products,
    // وظيفة للتحقق السريع من أي ميزة
    hasAccess: (feature: keyof typeof limits) => !!limits[feature]
  };
}
