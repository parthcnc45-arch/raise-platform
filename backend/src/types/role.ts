export interface Role {
  id: string;
  name: string;
  code: string;
  is_system?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type RoleCode = 'super_admin' | 'admin' | 'user';

