'use client';

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

const STATUS_TABS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기중' },
  { value: 'completed', label: '완료' },
  { value: 'rejected', label: '반려' },
];

const AI_TOOLS = [
  { value: 'all', label: '전체' },
  { value: 'Claude Code', label: 'Claude Code' },
  { value: 'Antigravity', label: 'Antigravity' },
  { value: 'Cursor AI', label: 'Cursor AI' },
  { value: 'Tabnine', label: 'Tabnine' },
];

const DEPARTMENTS = [
  { value: 'all', label: '전체' },
  { value: '데이터팀', label: '데이터팀' },
  { value: '웹개발팀', label: '웹개발팀' },
  { value: '플랫폼팀', label: '플랫폼팀' },
  { value: 'AI연구팀', label: 'AI연구팀' },
  { value: '백엔드팀', label: '백엔드팀' },
];

const SORT_OPTIONS = [
  { value: 'dueDate', label: 'SLA순' },
  { value: 'submittedAt', label: '신청일순' },
];

interface ReviewListFiltersProps {
  onFilterChange?: (filters: Record<string, string>) => void;
}

export default function ReviewListFilters({ onFilterChange }: ReviewListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentTool = searchParams.get('tool') || 'all';
  const currentDepartment = searchParams.get('department') || 'all';
  const currentSort = searchParams.get('sortBy') || 'dueDate';
  const currentSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateParams({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const activeFilters: { key: string; label: string }[] = [];
  if (currentTool !== 'all') activeFilters.push({ key: 'tool', label: currentTool });
  if (currentDepartment !== 'all')
    activeFilters.push({ key: 'department', label: currentDepartment });
  if (currentSearch) activeFilters.push({ key: 'search', label: `"${currentSearch}"` });

  const clearAllFilters = () => {
    setSearchInput('');
    router.push(pathname);
  };

  const removeFilter = (key: string) => {
    if (key === 'search') {
      setSearchInput('');
    }
    updateParams({ [key]: '' });
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <Tabs value={currentStatus} onValueChange={(v) => updateParams({ status: v })}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Select
          value={currentTool}
          onValueChange={(v) => updateParams({ tool: v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="AI 도구" />
          </SelectTrigger>
          <SelectContent>
            {AI_TOOLS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentDepartment}
          onValueChange={(v) => updateParams({ department: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="부서" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="신청자명, 신청번호 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={currentSort}
          onValueChange={(v) => updateParams({ sortBy: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">적용 필터:</span>
          {activeFilters.map((f) => (
            <Badge
              key={f.key}
              variant="secondary"
              className="gap-1 bg-[#50CF94]/15 text-[#2d8a5e]"
            >
              {f.label}
              <button
                onClick={() => removeFilter(f.key)}
                className="ml-0.5 rounded-full hover:bg-[#50CF94]/25"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="link"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto p-0 text-[#50CF94]"
          >
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
