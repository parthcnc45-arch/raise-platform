export interface Event {
  id: string;
  name: string;
  code: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  status?: string;
  is_active?: boolean;
  application_end_date?: string;
  application_invitation_body?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

