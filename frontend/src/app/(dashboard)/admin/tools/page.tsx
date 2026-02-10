'use client';

import { useState } from 'react';
import {
  Plus,
  Settings2,
  Power,
  PowerOff,
  Pencil,
  Bot,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AiTool } from '@/types';

// --- Inline Mock Data ---
const initialTools: (AiTool & { usersCount: number; totalCost: number })[] = [
  {
    id: 'tool-001',
    name: 'Claude Code',
    vendor: 'Anthropic',
    description: 'AI 기반 코드 어시스턴트로, 코드 작성/리뷰/디버깅/리팩토링을 지원합니다.',
    iconUrl: '/icons/claude-code.svg',
    apiEndpoint: 'https://api.anthropic.com/v1',
    authMethod: 'API_KEY',
    tokenCost: 0.015,
    defaultQuota: 1000000,
    isActive: true,
    usersCount: 45,
    totalCost: 4250,
  },
  {
    id: 'tool-002',
    name: 'GitHub Copilot',
    vendor: 'GitHub / Microsoft',
    description: 'IDE 통합 AI 코드 자동완성 도구로, 실시간 코드 제안을 제공합니다.',
    iconUrl: '/icons/github-copilot.svg',
    apiEndpoint: 'https://api.githubcopilot.com/v1',
    authMethod: 'OAUTH',
    tokenCost: 0.01,
    defaultQuota: 2000000,
    isActive: true,
    usersCount: 32,
    totalCost: 2180,
  },
  {
    id: 'tool-003',
    name: 'Cursor AI',
    vendor: 'Anysphere',
    description: 'AI 기반 코드 에디터로, 코드 생성 및 편집을 위한 통합 환경을 제공합니다.',
    iconUrl: '/icons/cursor-ai.svg',
    apiEndpoint: 'https://api.cursor.sh/v1',
    authMethod: 'API_KEY',
    tokenCost: 0.012,
    defaultQuota: 1500000,
    isActive: true,
    usersCount: 18,
    totalCost: 950,
  },
  {
    id: 'tool-004',
    name: 'Tabnine',
    vendor: 'Tabnine',
    description: 'AI 코드 어시스턴트로, 다양한 IDE에서 코드 자동완성을 지원합니다.',
    iconUrl: '/icons/tabnine.svg',
    apiEndpoint: 'https://api.tabnine.com/v1',
    authMethod: 'TOKEN',
    tokenCost: 0.008,
    defaultQuota: 3000000,
    isActive: false,
    usersCount: 0,
    totalCost: 0,
  },
];

interface ToolFormState {
  name: string;
  vendor: string;
  description: string;
  apiEndpoint: string;
  authMethod: string;
  tokenCost: string;
  defaultQuota: string;
}

const emptyForm: ToolFormState = {
  name: '',
  vendor: '',
  description: '',
  apiEndpoint: '',
  authMethod: 'API_KEY',
  tokenCost: '',
  defaultQuota: '',
};

export default function ToolsManagementPage() {
  const [tools, setTools] = useState(initialTools);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [form, setForm] = useState<ToolFormState>(emptyForm);
  const [toggleTarget, setToggleTarget] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingTool(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (tool: (typeof tools)[0]) => {
    setEditingTool(tool.id);
    setForm({
      name: tool.name,
      vendor: tool.vendor,
      description: tool.description ?? '',
      apiEndpoint: tool.apiEndpoint ?? '',
      authMethod: tool.authMethod,
      tokenCost: String(tool.tokenCost),
      defaultQuota: String(tool.defaultQuota),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.vendor) return;

    if (editingTool) {
      setTools((prev) =>
        prev.map((t) =>
          t.id === editingTool
            ? {
                ...t,
                name: form.name,
                vendor: form.vendor,
                description: form.description,
                apiEndpoint: form.apiEndpoint,
                authMethod: form.authMethod,
                tokenCost: parseFloat(form.tokenCost) || 0,
                defaultQuota: parseInt(form.defaultQuota) || 0,
              }
            : t
        )
      );
    } else {
      const newTool = {
        id: `tool-${Date.now()}`,
        name: form.name,
        vendor: form.vendor,
        description: form.description,
        apiEndpoint: form.apiEndpoint,
        authMethod: form.authMethod,
        tokenCost: parseFloat(form.tokenCost) || 0,
        defaultQuota: parseInt(form.defaultQuota) || 0,
        isActive: true,
        usersCount: 0,
        totalCost: 0,
      };
      setTools((prev) => [...prev, newTool]);
    }
    setDialogOpen(false);
  };

  const handleToggleActive = () => {
    if (!toggleTarget) return;
    setTools((prev) =>
      prev.map((t) =>
        t.id === toggleTarget ? { ...t, isActive: !t.isActive } : t
      )
    );
    setToggleTarget(null);
  };

  const targetTool = tools.find((t) => t.id === toggleTarget);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 도구 관리</h1>
          <p className="text-muted-foreground">
            등록된 AI 도구를 관리하고 새 도구를 추가하세요
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd}>
              <Plus className="mr-1.5 h-4 w-4" />
              새 도구 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>
                {editingTool ? '도구 수정' : '새 AI 도구 추가'}
              </DialogTitle>
              <DialogDescription>
                {editingTool
                  ? '도구 정보를 수정하세요.'
                  : '새로운 AI 도구의 정보를 입력하세요.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">도구명 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="예: Claude Code"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vendor">벤더 *</Label>
                <Input
                  id="vendor"
                  value={form.vendor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vendor: e.target.value }))
                  }
                  placeholder="예: Anthropic"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="도구에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  value={form.apiEndpoint}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apiEndpoint: e.target.value }))
                  }
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>인증 방식</Label>
                  <Select
                    value={form.authMethod}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, authMethod: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="API_KEY">API Key</SelectItem>
                      <SelectItem value="OAUTH">OAuth</SelectItem>
                      <SelectItem value="TOKEN">Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tokenCost">토큰 단가 ($)</Label>
                  <Input
                    id="tokenCost"
                    type="number"
                    step="0.001"
                    value={form.tokenCost}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tokenCost: e.target.value }))
                    }
                    placeholder="0.015"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="defaultQuota">기본 쿼터</Label>
                  <Input
                    id="defaultQuota"
                    type="number"
                    value={form.defaultQuota}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, defaultQuota: e.target.value }))
                    }
                    placeholder="1000000"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleSave}>
                {editingTool ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`relative ${!tool.isActive ? 'opacity-60' : ''}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Bot className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tool.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        tool.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }
                    >
                      {tool.isActive ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tool.vendor}
                  </p>
                </div>
              </div>

              {tool.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {tool.description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                <div className="text-center">
                  <p className="text-lg font-bold">{tool.usersCount}</p>
                  <p className="text-xs text-muted-foreground">사용자</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    ${tool.tokenCost}
                  </p>
                  <p className="text-xs text-muted-foreground">토큰 단가</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    ${tool.totalCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">총 비용</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenEdit(tool)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${
                    tool.isActive
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                  onClick={() => setToggleTarget(tool.id)}
                >
                  {tool.isActive ? (
                    <>
                      <PowerOff className="mr-1 h-3.5 w-3.5" />
                      비활성화
                    </>
                  ) : (
                    <>
                      <Power className="mr-1 h-3.5 w-3.5" />
                      활성화
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toggle Confirmation AlertDialog */}
      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {targetTool?.isActive ? '도구 비활성화' : '도구 활성화'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {targetTool?.isActive
                ? `"${targetTool?.name}"을(를) 비활성화하시겠습니까? 비활성화 시 신규 신청이 불가능하며, 기존 사용자에게 알림이 발송됩니다.`
                : `"${targetTool?.name}"을(를) 다시 활성화하시겠습니까?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActive}
              className={
                targetTool?.isActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {targetTool?.isActive ? '비활성화' : '활성화'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
