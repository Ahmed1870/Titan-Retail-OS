import { PLANS } from '@/config/plans'

export const usePlanAccess = (planName: string) => {
  const planLevels = { 'FREE': 0, 'PRO': 1, 'ENTERPRISE': 2 };
  
  const canAccess = (requiredPlan: keyof typeof planLevels) => {
    const currentLevel = planLevels[planName as keyof typeof planLevels] || 0;
    const requiredLevel = planLevels[requiredPlan];
    return currentLevel >= requiredLevel;
  };

  return { canAccess, plan: planName };
};
