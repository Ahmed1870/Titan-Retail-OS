export const PLAN_LIMITS = {
  starter: {
    max_products: 50,
    max_staff: 1,
    can_access_analytics: false,
    can_custom_brand: false,
    commission_rate: 0.15, // 15% عمولة
  },
  pro: {
    max_products: 500,
    max_staff: 10,
    can_access_analytics: true,
    can_custom_brand: true,
    commission_rate: 0.10, // 10% عمولة
  },
  enterprise: {
    max_products: 99999, // Unlimitied
    max_staff: 100,
    can_access_analytics: true,
    can_custom_brand: true,
    commission_rate: 0.05, // 5% عمولة
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
