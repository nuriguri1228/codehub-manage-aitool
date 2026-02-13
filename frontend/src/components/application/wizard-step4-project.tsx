'use client';

import { useState } from 'react';
import { Plus, Trash2, Search, UserPlus, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/common';
import { mockUserSearchApi } from '@/lib/mock-api';
import type { Project, ProjectMember } from '@/types';

interface WizardStep4Props {
  value: Project[];
  onChange: (projects: Project[]) => void;
  error?: string;
}

const emptyProject: Project = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  role: '',
  pmName: '',
  pmEmail: '',
  members: [],
};

function MemberSearch({
  onAdd,
  existingIds,
}: {
  onAdd: (member: ProjectMember) => void;
  existingIds: Set<string>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProjectMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState<ProjectMember>({
    knoxId: '',
    name: '',
    department: '',
    position: '',
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await mockUserSearchApi.searchUsers(query);
      setResults(res.data);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualAdd = () => {
    if (!manual.knoxId.trim() || !manual.name.trim() || !manual.department.trim()) return;
    onAdd({ ...manual });
    setManual({ knoxId: '', name: '', department: '', position: '' });
    setShowManual(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Knox ID 또는 이름으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSearch} disabled={isSearching}>
          검색
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowManual(!showManual)}
          className="text-muted-foreground"
        >
          수동 입력
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-md border bg-background">
          {results.map((user) => (
            <button
              key={user.knoxId}
              type="button"
              disabled={existingIds.has(user.knoxId)}
              onClick={() => {
                onAdd(user);
                setResults([]);
                setQuery('');
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {user.name} ({user.knoxId}) - {user.department}
                {user.position && ` / ${user.position}`}
              </span>
              {existingIds.has(user.knoxId) ? (
                <Badge variant="secondary" className="text-xs">추가됨</Badge>
              ) : (
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      )}

      {showManual && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">수동 입력</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Input
              placeholder="Knox ID *"
              value={manual.knoxId}
              onChange={(e) => setManual((p) => ({ ...p, knoxId: e.target.value }))}
            />
            <Input
              placeholder="이름 *"
              value={manual.name}
              onChange={(e) => setManual((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="부서 *"
              value={manual.department}
              onChange={(e) => setManual((p) => ({ ...p, department: e.target.value }))}
            />
            <Input
              placeholder="직급"
              value={manual.position ?? ''}
              onChange={(e) => setManual((p) => ({ ...p, position: e.target.value }))}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleManualAdd}>
            <UserPlus className="mr-1 h-4 w-4" />
            추가
          </Button>
        </div>
      )}
    </div>
  );
}

export function WizardStep4Project({ value, onChange, error }: WizardStep4Props) {
  const projects = value.length > 0 ? value : [{ ...emptyProject }];

  const addProject = () => {
    onChange([...projects, { ...emptyProject }]);
  };

  const removeProject = (index: number) => {
    if (projects.length <= 1) return;
    onChange(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, val: string) => {
    const updated = projects.map((p, i) =>
      i === index ? { ...p, [field]: val } : p
    );
    onChange(updated);
  };

  const updateProjectFiles = (index: number, files: File[]) => {
    const updated = projects.map((p, i) =>
      i === index ? { ...p, attachments: files } : p
    );
    onChange(updated);
  };

  const addMember = (projectIndex: number, member: ProjectMember) => {
    const updated = projects.map((p, i) => {
      if (i !== projectIndex) return p;
      const members = p.members ?? [];
      if (members.some((m) => m.knoxId === member.knoxId)) return p;
      return { ...p, members: [...members, member] };
    });
    onChange(updated);
  };

  const removeMember = (projectIndex: number, knoxId: string) => {
    const updated = projects.map((p, i) => {
      if (i !== projectIndex) return p;
      return { ...p, members: (p.members ?? []).filter((m) => m.knoxId !== knoxId) };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">프로젝트 정보</h3>
          <p className="text-sm text-muted-foreground">
            AI 도구를 활용할 프로젝트 정보와 과제원을 입력하세요.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addProject}>
          <Plus className="mr-1 h-4 w-4" />
          프로젝트 추가
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {projects.map((project, index) => {
          const members = project.members ?? [];
          const existingIds = new Set(members.map((m) => m.knoxId));
          return (
            <Card key={index}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    프로젝트 #{index + 1}
                  </span>
                  {projects.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeProject(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      삭제
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>프로젝트명 *</Label>
                    <Input
                      placeholder="프로젝트명을 입력하세요"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>역할 *</Label>
                    <Input
                      placeholder="프로젝트 내 역할"
                      value={project.role}
                      onChange={(e) => updateProject(index, 'role', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>프로젝트 설명 *</Label>
                  <Textarea
                    placeholder="프로젝트에 대한 간략한 설명"
                    value={project.description}
                    onChange={(e) =>
                      updateProject(index, 'description', e.target.value)
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>시작일 *</Label>
                    <Input
                      type="date"
                      value={project.startDate}
                      onChange={(e) =>
                        updateProject(index, 'startDate', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>종료일 *</Label>
                    <Input
                      type="date"
                      value={project.endDate}
                      onChange={(e) =>
                        updateProject(index, 'endDate', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>PM 이름 *</Label>
                    <Input
                      placeholder="PM 이름"
                      value={project.pmName}
                      onChange={(e) =>
                        updateProject(index, 'pmName', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>PM 이메일</Label>
                    <Input
                      type="email"
                      placeholder="PM 이메일"
                      value={project.pmEmail ?? ''}
                      onChange={(e) =>
                        updateProject(index, 'pmEmail', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* 과제원 목록 */}
                <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">
                      과제원 목록 *
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      {members.length}명
                    </Badge>
                  </div>

                  <MemberSearch
                    onAdd={(member) => addMember(index, member)}
                    existingIds={existingIds}
                  />

                  {members.length > 0 && (
                    <div className="rounded-md border bg-background">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Knox ID</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">이름</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">부서</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">직급</th>
                            <th className="px-3 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m) => (
                            <tr key={m.knoxId} className="border-b last:border-b-0">
                              <td className="px-3 py-2 font-mono text-xs">{m.knoxId}</td>
                              <td className="px-3 py-2">{m.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">{m.department}</td>
                              <td className="px-3 py-2 text-muted-foreground">{m.position || '-'}</td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => removeMember(index, m.knoxId)}
                                  className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {members.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-3">
                      과제원을 검색하여 추가하거나 수동으로 입력하세요.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-gray-500">프로젝트 관련 첨부파일 (선택)</Label>
                  <FileUpload
                    value={project.attachments ?? []}
                    onChange={(files) => updateProjectFiles(index, files)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
