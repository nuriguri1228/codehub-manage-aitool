import type {
  Application,
  ApplicationSummary,
  ApplicationStats,
  ApplicationFormData,
  ApplicationStatus,
  AiTool,
  ApiKey,
  License,
  UsageLog,
  DailyUsage,
  DashboardStats,
  ToolDistribution,
  MonthlyTrend,
  TopUser,
  AnomalyAlert,
  MonitoringStats,
  ReviewStage,
  ReviewFeedback,
  ReviewDetail,
  ReviewFormData,
  ReviewListItem,
  ReviewStats,
  AuditLog,
  AuditAction,
  User,
  PaginatedResponse,
  PaginationParams,
  FilterState,
  LicenseStatus,
} from '@/types';
import type { Notification } from '@/stores/notification-store';
import {
  mockUsers,
  mockAiTools,
  mockApplications,
  mockReviewStages,
  mockReviewFeedbacks,
  mockReviewListItems,
  mockReviewStats,
  mockApiKeys,
  mockLicenses,
  mockUsageLogs,
  mockDailyUsage,
  mockDashboardStats,
  mockApplicationStats,
  mockToolDistribution,
  mockMonthlyTrends,
  mockTopUsers,
  mockMonitoringStats,
  mockAnomalyAlerts,
  mockNotifications,
  mockAuditLogs,
  getApplicationSummaries,
  defaultCurrentUser,
} from './mock-data';

// ─── 딜레이 시뮬레이션 ────────────────────────────────────────────

function delay(ms?: number): Promise<void> {
  const duration = ms ?? (300 + Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// ─── 페이지네이션 유틸 ────────────────────────────────────────────

function paginate<T>(
  items: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = params;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    meta: { total, page, limit, totalPages },
  };
}

// ─── 인증 ─────────────────────────────────────────────────────────

export const mockAuthApi = {
  async login(employeeId: string, _password: string) {
    await delay();
    const user = mockUsers.find((u) => u.employeeId === employeeId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return {
      success: true,
      data: {
        user,
        accessToken: `mock-token-${user.id}-${Date.now()}`,
      },
    };
  },

  async getMe() {
    await delay();
    return { success: true, data: defaultCurrentUser };
  },

  async getUsers() {
    await delay();
    return { success: true, data: mockUsers };
  },
};

// ─── AI 도구 ──────────────────────────────────────────────────────

export const mockToolApi = {
  async getTools() {
    await delay();
    return { success: true, data: mockAiTools };
  },

  async getActiveTool() {
    await delay();
    return { success: true, data: mockAiTools.filter((t) => t.isActive) };
  },

  async getToolById(id: string) {
    await delay();
    const tool = mockAiTools.find((t) => t.id === id);
    if (!tool) throw new Error('도구를 찾을 수 없습니다.');
    return { success: true, data: tool };
  },

  async createTool(data: Partial<AiTool>) {
    await delay();
    const newTool: AiTool = {
      id: `tool-${Date.now()}`,
      name: data.name ?? '',
      vendor: data.vendor ?? '',
      description: data.description,
      iconUrl: data.iconUrl,
      apiEndpoint: data.apiEndpoint,
      authMethod: data.authMethod ?? 'API_KEY',
      tokenCost: data.tokenCost ?? 0,
      defaultQuota: data.defaultQuota ?? 1000000,
      isActive: data.isActive ?? true,
    };
    mockAiTools.push(newTool);
    return { success: true, data: newTool };
  },

  async updateTool(id: string, data: Partial<AiTool>) {
    await delay();
    const idx = mockAiTools.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('도구를 찾을 수 없습니다.');
    mockAiTools[idx] = { ...mockAiTools[idx], ...data };
    return { success: true, data: mockAiTools[idx] };
  },

  async deleteTool(id: string) {
    await delay();
    const idx = mockAiTools.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('도구를 찾을 수 없습니다.');
    mockAiTools.splice(idx, 1);
    return { success: true, data: null };
  },
};

// ─── 신청서 ───────────────────────────────────────────────────────

export const mockApplicationApi = {
  async getApplications(
    params: PaginationParams & FilterState & { userId?: string }
  ) {
    await delay();
    let items = [...mockApplications];

    if (params.userId) {
      items = items.filter((a) => a.applicantId === params.userId);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(q) ||
          a.aiToolNames.some((name) => name.toLowerCase().includes(q)) ||
          a.applicantName.toLowerCase().includes(q)
      );
    }
    if (params.status) {
      items = items.filter((a) => a.status === params.status);
    }
    if (params.tool) {
      items = items.filter((a) => a.aiToolIds.includes(params.tool!));
    }

    if (params.sortBy) {
      const key = params.sortBy as keyof Application;
      const order = params.sortOrder === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        const va = a[key] ?? '';
        const vb = b[key] ?? '';
        return va < vb ? -order : va > vb ? order : 0;
      });
    } else {
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return { success: true, ...paginate(items, params) };
  },

  async getApplicationSummaries(userId: string) {
    await delay();
    return { success: true, data: getApplicationSummaries(userId) };
  },

  async getApplicationById(id: string) {
    await delay();
    const app = mockApplications.find((a) => a.id === id);
    if (!app) throw new Error('신청서를 찾을 수 없습니다.');
    return { success: true, data: app };
  },

  async getApplicationStats(userId?: string): Promise<{ success: boolean; data: ApplicationStats }> {
    await delay();
    if (!userId) {
      return { success: true, data: mockApplicationStats };
    }
    const apps = mockApplications.filter((a) => a.applicantId === userId);
    const stats: ApplicationStats = {
      total: apps.length,
      draft: apps.filter((a) => a.status === 'DRAFT').length,
      inReview: apps.filter((a) =>
        ['SUBMITTED', 'TEAM_REVIEW', 'SECURITY_REVIEW', 'ENV_PREPARATION', 'LICENSE_ISSUANCE'].includes(a.status)
      ).length,
      approved: apps.filter((a) => a.status === 'APPROVED').length,
      rejected: apps.filter((a) => a.status === 'REJECTED').length,
      keyIssued: apps.filter((a) => a.status === 'KEY_ISSUED').length,
    };
    return { success: true, data: stats };
  },

  async createApplication(data: Partial<ApplicationFormData>) {
    await delay();
    const toolIds = data.aiToolIds ?? [];
    const toolNames = toolIds.map((id) => {
      const tool = mockAiTools.find((t) => t.id === id);
      return tool?.name ?? '';
    });
    const newApp: Application = {
      id: `app-${Date.now()}`,
      applicationNumber: `APP-2024-${String(mockApplications.length + 1).padStart(4, '0')}`,
      applicantId: defaultCurrentUser.id,
      applicantName: defaultCurrentUser.name,
      applicantDepartment: defaultCurrentUser.department,
      applicantPosition: defaultCurrentUser.position,
      aiToolIds: toolIds,
      aiToolNames: toolNames,
      environment: data.environment ?? 'VDI',
      purpose: data.purpose ?? '',
      status: 'DRAFT',
      projects: data.projects ?? [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockApplications.push(newApp);
    return { success: true, data: newApp };
  },

  async updateApplication(id: string, data: Partial<Application>) {
    await delay();
    const idx = mockApplications.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('신청서를 찾을 수 없습니다.');
    mockApplications[idx] = {
      ...mockApplications[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: mockApplications[idx] };
  },

  async submitApplication(id: string) {
    await delay();
    const idx = mockApplications.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('신청서를 찾을 수 없습니다.');
    const now = new Date().toISOString();
    mockApplications[idx] = {
      ...mockApplications[idx],
      status: 'SUBMITTED',
      submittedAt: now,
      updatedAt: now,
    };
    return { success: true, data: mockApplications[idx] };
  },

  async deleteApplication(id: string) {
    await delay();
    const idx = mockApplications.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('신청서를 찾을 수 없습니다.');
    if (mockApplications[idx].status !== 'DRAFT') {
      throw new Error('임시저장 상태의 신청서만 삭제할 수 있습니다.');
    }
    mockApplications.splice(idx, 1);
    return { success: true, data: null };
  },

  async cancelApplication(id: string, reason: string) {
    await delay();
    const idx = mockApplications.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('신청서를 찾을 수 없습니다.');
    if (mockApplications[idx].status !== 'SUBMITTED') {
      throw new Error('제출 상태의 신청서만 취소할 수 있습니다.');
    }
    const now = new Date().toISOString();
    mockApplications[idx] = {
      ...mockApplications[idx],
      status: 'REJECTED',
      updatedAt: now,
    };
    return { success: true, data: mockApplications[idx] };
  },
};

// ─── 검토 ─────────────────────────────────────────────────────────

export const mockReviewApi = {
  async getReviewList(
    params: PaginationParams & FilterState & { reviewerId?: string; stageName?: string }
  ) {
    await delay();
    let items = [...mockReviewListItems];

    if (params.stageName) {
      items = items.filter((r) => r.stageName === params.stageName);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.applicationNumber.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          r.aiToolNames.some((name) => name.toLowerCase().includes(q))
      );
    }
    if (params.status) {
      items = items.filter((r) => r.slaStatus === params.status);
    }

    return { success: true, ...paginate(items, params) };
  },

  async getReviewDetail(applicationId: string): Promise<{ success: boolean; data: ReviewDetail }> {
    await delay();
    const app = mockApplications.find((a) => a.id === applicationId);
    if (!app) throw new Error('신청서를 찾을 수 없습니다.');

    const stages = mockReviewStages.filter((s) => s.applicationId === applicationId);
    const currentStage =
      stages.find((s) => !s.result) ?? stages[stages.length - 1];
    const feedbacks = mockReviewFeedbacks.filter((f) =>
      stages.some((s) => s.id === f.reviewStageId)
    );

    return {
      success: true,
      data: { application: app, currentStage, allStages: stages, feedbacks },
    };
  },

  async submitReview(
    reviewStageId: string,
    data: ReviewFormData
  ) {
    await delay();
    const idx = mockReviewStages.findIndex((s) => s.id === reviewStageId);
    if (idx === -1) throw new Error('검토 단계를 찾을 수 없습니다.');
    const now = new Date().toISOString();
    mockReviewStages[idx] = {
      ...mockReviewStages[idx],
      result: data.result,
      comment: data.comment,
      checklist: data.checklist,
      reviewedAt: now,
    };

    // 신청서 상태 업데이트
    const stage = mockReviewStages[idx];
    const appIdx = mockApplications.findIndex(
      (a) => a.id === stage.applicationId
    );
    if (appIdx !== -1) {
      let newStatus: ApplicationStatus = mockApplications[appIdx].status;
      if (data.result === 'REJECTED') {
        newStatus = 'REJECTED';
      } else if (data.result === 'FEEDBACK_REQUESTED') {
        newStatus = 'FEEDBACK_REQUESTED';
      } else if (data.result === 'APPROVED') {
        const nextStageMap: Record<string, ApplicationStatus> = {
          TEAM_REVIEW: 'SECURITY_REVIEW',
          SECURITY_REVIEW: 'ENV_PREPARATION',
          ENV_PREPARATION: 'LICENSE_ISSUANCE',
          LICENSE_ISSUANCE: 'KEY_ISSUED',
        };
        newStatus = nextStageMap[stage.stageName] ?? newStatus;

        // LICENSE_ISSUANCE 승인 시 License + ApiKey 자동 생성
        if (stage.stageName === 'LICENSE_ISSUANCE') {
          const app = mockApplications[appIdx];
          const quotaLimit = data.licenseConfig?.quotaLimit ?? 1000000;
          const validityMonths = data.licenseConfig?.validityMonths ?? 12;
          const expiresAt = new Date(Date.now() + validityMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
          const licenseSeq = String(mockLicenses.length + 1).padStart(4, '0');
          const year = new Date().getFullYear();

          // 각 AI 도구별로 License + ApiKey 생성
          for (let i = 0; i < app.aiToolIds.length; i++) {
            const toolId = app.aiToolIds[i];
            const toolName = app.aiToolNames[i];
            const tool = mockAiTools.find((t) => t.id === toolId);
            const keyPrefix = tool?.authMethod === 'API_KEY' ? 'sk-ai' : 'tok';
            const seqNum = String(mockLicenses.length + 1).padStart(4, '0');

            const newLicense: License = {
              id: `lic-${Date.now()}-${i}`,
              licenseNumber: `LIC-${year}-${seqNum}`,
              userId: app.applicantId,
              userName: app.applicantName,
              userDepartment: app.applicantDepartment,
              aiToolId: toolId,
              aiToolName: toolName,
              environment: app.environment,
              status: 'ACTIVE',
              issuedAt: now,
              expiresAt,
              quotaLimit,
              quotaUsed: 0,
              usagePercent: 0,
            };
            mockLicenses.push(newLicense);

            const newApiKey: ApiKey = {
              id: `key-${Date.now()}-${i}`,
              applicationId: app.id,
              aiToolName: toolName,
              keyPrefix,
              maskedKey: `${keyPrefix}_****-****-****-${Math.random().toString().slice(2, 6)}`,
              environment: app.environment,
              status: 'ACTIVE',
              issuedAt: now,
              expiresAt,
              usageCount: 0,
              quotaLimit,
              quotaUsed: 0,
            };
            mockApiKeys.push(newApiKey);
          }
        }
      }
      mockApplications[appIdx] = {
        ...mockApplications[appIdx],
        status: newStatus,
        updatedAt: now,
        ...(newStatus === 'KEY_ISSUED' ? { completedAt: now } : {}),
      };
    }

    return { success: true, data: mockReviewStages[idx] };
  },

  async getReviewStats(): Promise<{ success: boolean; data: ReviewStats }> {
    await delay();
    return { success: true, data: mockReviewStats };
  },
};

// ─── API Key ──────────────────────────────────────────────────────

export const mockApiKeyApi = {
  async getApiKeys(userId?: string) {
    await delay();
    let keys = [...mockApiKeys];
    if (userId) {
      const userApps = mockApplications
        .filter((a) => a.applicantId === userId)
        .map((a) => a.id);
      keys = keys.filter((k) => userApps.includes(k.applicationId));
    }
    return { success: true, data: keys };
  },

  async getApiKeyById(id: string) {
    await delay();
    const key = mockApiKeys.find((k) => k.id === id);
    if (!key) throw new Error('API Key를 찾을 수 없습니다.');
    return { success: true, data: key };
  },

  async regenerateApiKey(id: string) {
    await delay();
    const idx = mockApiKeys.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('API Key를 찾을 수 없습니다.');
    mockApiKeys[idx] = {
      ...mockApiKeys[idx],
      maskedKey: `${mockApiKeys[idx].keyPrefix}_****-****-****-${Math.random().toString().slice(2, 6)}`,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    return { success: true, data: mockApiKeys[idx] };
  },

  async revokeApiKey(id: string) {
    await delay();
    const idx = mockApiKeys.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('API Key를 찾을 수 없습니다.');
    mockApiKeys[idx] = { ...mockApiKeys[idx], status: 'REVOKED' as LicenseStatus };
    return { success: true, data: mockApiKeys[idx] };
  },
};

// ─── 라이센스 ─────────────────────────────────────────────────────

export const mockLicenseApi = {
  async getLicenses(params: PaginationParams & FilterState) {
    await delay();
    let items = [...mockLicenses];
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (l) =>
          l.licenseNumber.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.aiToolName.toLowerCase().includes(q)
      );
    }
    if (params.status) {
      items = items.filter((l) => l.status === params.status);
    }
    if (params.tool) {
      items = items.filter((l) => l.aiToolId === params.tool);
    }
    return { success: true, ...paginate(items, params) };
  },

  async updateLicenseStatus(id: string, status: LicenseStatus) {
    await delay();
    const idx = mockLicenses.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('라이센스를 찾을 수 없습니다.');
    mockLicenses[idx] = { ...mockLicenses[idx], status };
    return { success: true, data: mockLicenses[idx] };
  },
};

// ─── 사용량 / 모니터링 ───────────────────────────────────────────

export const mockMonitoringApi = {
  async getMonitoringStats() {
    await delay();
    return { success: true, data: mockMonitoringStats };
  },

  async getDailyUsage(params?: { from?: string; to?: string }) {
    await delay();
    let data = [...mockDailyUsage];
    if (params?.from) {
      data = data.filter((d) => d.date >= params.from!);
    }
    if (params?.to) {
      data = data.filter((d) => d.date <= params.to!);
    }
    return { success: true, data };
  },

  async getUsageLogs(params: PaginationParams & { userId?: string; toolName?: string }) {
    await delay();
    let items = [...mockUsageLogs];
    if (params.userId) {
      items = items.filter((l) => l.userId === params.userId);
    }
    if (params.toolName) {
      items = items.filter((l) => l.aiToolName === params.toolName);
    }
    return { success: true, ...paginate(items, params) };
  },

  async getTopUsers() {
    await delay();
    return { success: true, data: mockTopUsers };
  },

  async getAnomalyAlerts() {
    await delay();
    return { success: true, data: mockAnomalyAlerts };
  },

  async resolveAlert(id: string) {
    await delay();
    const idx = mockAnomalyAlerts.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('알림을 찾을 수 없습니다.');
    mockAnomalyAlerts[idx] = { ...mockAnomalyAlerts[idx], resolved: true };
    return { success: true, data: mockAnomalyAlerts[idx] };
  },
};

// ─── 대시보드 ─────────────────────────────────────────────────────

export const mockDashboardApi = {
  async getStats() {
    await delay();
    return { success: true, data: mockDashboardStats };
  },

  async getToolDistribution() {
    await delay();
    return { success: true, data: mockToolDistribution };
  },

  async getMonthlyTrends() {
    await delay();
    return { success: true, data: mockMonthlyTrends };
  },
};

// ─── 알림 ─────────────────────────────────────────────────────────

export const mockNotificationApi = {
  async getNotifications(userId?: string) {
    await delay();
    return { success: true, data: mockNotifications };
  },

  async markAsRead(id: string) {
    await delay();
    const idx = mockNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      (mockNotifications[idx] as Notification).read = true;
    }
    return { success: true, data: null };
  },

  async markAllAsRead() {
    await delay();
    mockNotifications.forEach((n) => {
      (n as Notification).read = true;
    });
    return { success: true, data: null };
  },
};

// ─── 감사 로그 ──────────────────────────────────────────────────

export const mockAuditApi = {
  async getAuditLogs(
    params: PaginationParams & {
      action?: AuditAction;
      userId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ) {
    await delay();
    let items = [...mockAuditLogs];

    if (params.action) {
      items = items.filter((l) => l.action === params.action);
    }
    if (params.userId) {
      items = items.filter((l) => l.userId === params.userId);
    }
    if (params.startDate) {
      items = items.filter((l) => l.createdAt >= params.startDate!);
    }
    if (params.endDate) {
      items = items.filter((l) => l.createdAt <= params.endDate!);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.targetId.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt desc by default
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { success: true, ...paginate(items, params) };
  },
};
