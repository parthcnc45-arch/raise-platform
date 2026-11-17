import { Role } from './role.js';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role_id: string;
  phone?: string | null;
  avatar?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  role?: Role | string;
  roles?: Role;
}
