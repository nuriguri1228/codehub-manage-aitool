'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  selectable,
  selectedKeys,
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  emptyMessage = '데이터가 없습니다',
  emptyAction,
  className,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedKeys?.size === data.length;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => String(row[keyField]))));
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return;
    const newKeys = new Set(selectedKeys);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }
    onSelectionChange(newKeys);
  };

  function SortIcon({ field }: { field: string }) {
    if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-[#1E40AF]" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-[#1E40AF]" />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-white py-16">
        <Inbox className="h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-white', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.sortable && 'cursor-pointer select-none',
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && <SortIcon field={col.key} />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const key = String(row[keyField]);
            const isSelected = selectedKeys?.has(key);

            return (
              <TableRow
                key={key}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-gray-50',
                  isSelected && 'bg-blue-50'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectRow(key)}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
