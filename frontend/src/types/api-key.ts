import type { LicenseStatus } from './common';

export interface ApiKey {
  id: string;
  applicationId: string;
  aiToolName: string;
  keyPrefix: string;
  maskedKey: string;
  environment: string;
  status: LicenseStatus;
  issuedAt: string;
  expiresAt: string;
  lastUsedAt?: string;
  usageCount: number;
  quotaLimit: number;
  quotaUsed: number;
}

export interface License {
  id: string;
  licenseNumber: string;
  userId: string;
  userName: string;
  userDepartment: string;
  aiToolId: string;
  aiToolName: string;
  environment: string;
  status: LicenseStatus;
  issuedAt: string;
  expiresAt: string;
  quotaLimit: number;
  quotaUsed: number;
  usagePercent: number;
}

export interface UsageLog {
  id: string;
  userId: string;
  userName: string;
  aiToolName: string;
  tokensUsed: number;
  cost: number;
  timestamp: string;
}

export interface MonitoringStats {
  totalApiCalls: number;
  totalTokensUsed: number;
  totalCost: number;
  activeUsers: number;
  totalUsers: number;
  changePercent: {
    apiCalls: number;
    tokens: number;
    cost: number;
  };
}

export interface DailyUsage {
  date: string;
  tokens: number;
  cost: number;
  apiCalls: number;
}

export interface TopUser {
  userId: string;
  userName: string;
  department: string;
  tokensUsed: number;
  percentage: number;
}

export interface AnomalyAlert {
  id: string;
  userId: string;
  userName: string;
  department: string;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: string;
  resolved: boolean;
}

export interface DashboardStats {
  totalLicenses: number;
  activeUsers: number;
  monthlyCost: number;
  budgetLimit: number;
  avgProcessingDays: number;
  slaRate: number;
  licenseChange: number;
  userChange: number;
}

export interface ToolDistribution {
  toolName: string;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  [toolName: string]: string | number;
}
