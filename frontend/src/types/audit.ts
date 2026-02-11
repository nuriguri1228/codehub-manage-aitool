export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPLICATION_CREATE'
  | 'APPLICATION_SUBMIT'
  | 'APPLICATION_CANCEL'
  | 'REVIEW_APPROVE'
  | 'REVIEW_REJECT'
  | 'REVIEW_FEEDBACK'
  | 'API_KEY_ISSUE'
  | 'API_KEY_REVOKE'
  | 'API_KEY_REGENERATE'
  | 'LICENSE_UPDATE'
  | 'TOOL_CREATE'
  | 'TOOL_UPDATE'
  | 'USER_ROLE_CHANGE'
  | 'SETTINGS_CHANGE';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  employeeId: string;
  action: AuditAction;
  target: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
