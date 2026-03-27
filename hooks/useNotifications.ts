export const useNotifications = (...args: any[]) => ({
  notifications: [],
  markAsRead: async (id: string) => {},
  unreadCount: 0
});

export const useRealtimeSubscriptions = (...args: any[]) => ({
  requests: args[0] || [],
  loading: false 
});
