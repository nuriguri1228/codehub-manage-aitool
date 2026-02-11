'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FILE_UPLOAD_MAX_SIZE,
  FILE_UPLOAD_ACCEPTED_TYPES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

interface FileUploadProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUpload({
  value = [],
  onChange,
  maxSize = FILE_UPLOAD_MAX_SIZE,
  acceptedTypes = FILE_UPLOAD_ACCEPTED_TYPES,
  multiple = true,
  className,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadedFile[]>(
    value.map((f) => ({ id: crypto.randomUUID(), file: f, progress: 100 }))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다`;
      }
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        return '지원하지 않는 파일 형식입니다';
      }
      return null;
    },
    [maxSize, acceptedTypes]
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const newUploadFiles: UploadedFile[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 100,
        error: validateFile(file) || undefined,
      }));

      const updated = [...uploadFiles, ...newUploadFiles];
      setUploadFiles(updated);
      onChange?.(updated.filter((f) => !f.error).map((f) => f.file));
    },
    [uploadFiles, onChange, validateFile]
  );

  const removeFile = useCallback(
    (id: string) => {
      const updated = uploadFiles.filter((f) => f.id !== id);
      setUploadFiles(updated);
      onChange?.(updated.filter((f) => !f.error).map((f) => f.file));
    },
    [uploadFiles, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        className={cn(
          'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragOver
            ? 'border-[#50CF94] bg-[#50CF94]/10'
            : 'border-gray-300 hover:border-gray-400'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          파일을 여기에 드래그하거나{' '}
          <button
            type="button"
            className="font-medium text-[#50CF94] hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            파일 찾아보기
          </button>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          최대 {formatFileSize(maxSize)} / PDF, DOCX, XLSX, PPTX, ZIP, 이미지
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* File list */}
      {uploadFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {uploadFiles.map((uf) => (
            <li
              key={uf.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2',
                uf.error ? 'border-red-200 bg-red-50' : 'bg-white'
              )}
            >
              <FileText className="h-5 w-5 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-700">
                  {uf.file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(uf.file.size)}
                </p>
                {uf.error && (
                  <p className="text-xs text-red-600">{uf.error}</p>
                )}
                {uf.progress < 100 && (
                  <Progress value={uf.progress} className="mt-1 h-1" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={() => removeFile(uf.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
