'use client'
export interface SystemLog {
  id: string;
  tenant_id: string;
  action_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

// توحيد مسميات الـ Logs في نوع واحد (Generic)
export type LogType = 'inventory' | 'order_status' | 'audit' | 'activity';
