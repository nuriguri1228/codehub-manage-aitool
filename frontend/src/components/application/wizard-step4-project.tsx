'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/common';
import type { Project } from '@/types';

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
};

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">프로젝트 정보</h3>
          <p className="text-sm text-muted-foreground">
            AI 도구를 활용할 프로젝트 정보를 입력하세요.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addProject}>
          <Plus className="mr-1 h-4 w-4" />
          프로젝트 추가
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {projects.map((project, index) => (
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

              <div className="space-y-1.5">
                <Label className="text-gray-500">프로젝트 관련 첨부파일 (선택)</Label>
                <FileUpload
                  value={project.attachments ?? []}
                  onChange={(files) => updateProjectFiles(index, files)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
