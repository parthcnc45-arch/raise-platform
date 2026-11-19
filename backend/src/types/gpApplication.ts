import { Event } from './event.js';

export interface GpApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  event_id: string;
  events?: Event;
  status: string;
  magic_token_hash?: string;
  magic_link_accessed?: boolean;
  magic_link_first_accessed_at?: string | null;
  magic_link_last_accessed_at?: string | null;
  magic_link_access_count?: number;
  magic_link_failed_attempts?: number;
  magic_link_locked_until?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

