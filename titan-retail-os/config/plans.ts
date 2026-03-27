import type { PlanType } from '@/types';

export const PLAN_CONFIG: Record<PlanType, {
  name: string; price: number; features: string[];
  limits: { products: number | 'unlimited'; couriers: number | 'unlimited'; orders_per_month: number | 'unlimited' };
}> = {
  starter: { name: 'Starter', price: 299, features: ['Up to 100 products','Basic analytics','Email support','1 courier'], limits: { products: 100, couriers: 1, orders_per_month: 500 } },
  pro: { name: 'Pro', price: 599, features: ['Unlimited products','Advanced analytics','Priority support','5 couriers','AI Ads','Referrals'], limits: { products: 'unlimited', couriers: 5, orders_per_month: 'unlimited' } },
  enterprise: { name: 'Enterprise', price: 1299, features: ['Everything in Pro','Custom domain','Dedicated support','Unlimited couriers','SLA'], limits: { products: 'unlimited', couriers: 'unlimited', orders_per_month: 'unlimited' } },
};
