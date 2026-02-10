import type { UserRole } from './common';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  teamLeadId?: string;
  teamLeadName?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
