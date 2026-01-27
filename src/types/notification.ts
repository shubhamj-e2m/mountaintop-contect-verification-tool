export type NotificationType = 
  | 'keywords_ready'
  | 'content_ready_for_review'
  | 'content_approved'
  | 'revision_requested'
  | 'analysis_complete';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link_url: string;
  page_id?: string | null;
  project_id?: string | null;
  read: boolean;
  dismissed: boolean;
  created_at: string;
}
