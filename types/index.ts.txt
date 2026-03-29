export * from './supabase';

export interface BaseTenantEntity {
  id: string;
  tenant_id: string;
  created_at: string;
}

export type LogAction = 'create' | 'update' | 'delete' | 'status_change';
