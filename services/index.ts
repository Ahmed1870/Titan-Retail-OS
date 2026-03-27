export const paymentService = {
  handleWebhook: async (body: any) => ({ success: true })
};
export const auditService = {
  getLogs: async (params: any) => []
};
export const subscriptionService = {
  getPendingRequests: async () => [],
  approveRequest: async (id: string, userId: string) => ({ success: true }),
  rejectRequest: async (id: string, userId: string, reason: string) => ({ success: true }),
  createRequest: async (data: any) => ({ success: true })
};
export const orderService = {
  list: async (tenantId: string, params: any) => [],
  updateStatus: async (id: string, status: string, userId: string, reason?: string) => ({ success: true })
};
export const reportService = { getDashboardStats: async (id: string) => ({}) };
export const referralService = { getStats: async (id: string) => ({}) };
