'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Power,
  PowerOff,
  Pencil,
  Trash2,
  Bot,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
import { mockToolApi } from '@/lib/mock-api';
import type { AiTool } from '@/types';

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
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [form, setForm] = useState<ToolFormState>(emptyForm);
  const [toggleTarget, setToggleTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['aiTools'],
    queryFn: () => mockToolApi.getTools(),
  });

  const tools = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<AiTool>) => mockToolApi.createTool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiTools'] });
      toast.success('도구가 추가되었습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AiTool> }) =>
      mockToolApi.updateTool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiTools'] });
      toast.success('도구가 수정되었습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockToolApi.deleteTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiTools'] });
      toast.success('도구가 삭제되었습니다.');
    },
  });

  const handleOpenAdd = () => {
    setEditingTool(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (tool: AiTool) => {
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

  const handleSave = async () => {
    if (!form.name || !form.vendor) return;

    const toolData: Partial<AiTool> = {
      name: form.name,
      vendor: form.vendor,
      description: form.description,
      apiEndpoint: form.apiEndpoint,
      authMethod: form.authMethod,
      tokenCost: parseFloat(form.tokenCost) || 0,
      defaultQuota: parseInt(form.defaultQuota) || 0,
    };

    if (editingTool) {
      await updateMutation.mutateAsync({ id: editingTool, data: toolData });
    } else {
      await createMutation.mutateAsync({ ...toolData, isActive: true });
    }
    setDialogOpen(false);
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    const tool = tools.find((t) => t.id === toggleTarget);
    if (!tool) return;
    await updateMutation.mutateAsync({
      id: toggleTarget,
      data: { isActive: !tool.isActive },
    });
    setToggleTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  const targetTool = tools.find((t) => t.id === toggleTarget);
  const deleteToolObj = tools.find((t) => t.id === deleteTarget);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 도구 관리</h1>
            <p className="text-muted-foreground">등록된 AI 도구를 관리하고 새 도구를 추가하세요</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

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

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3">
                <div className="text-center">
                  <p className="text-lg font-bold">
                    ${tool.tokenCost}
                  </p>
                  <p className="text-xs text-muted-foreground">토큰 단가</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {(tool.defaultQuota / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-muted-foreground">기본 쿼터</p>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(tool.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>도구 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteToolObj?.name}&quot;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
