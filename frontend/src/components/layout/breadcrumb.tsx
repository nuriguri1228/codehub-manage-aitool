'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: '대시보드',
  applications: '내 신청',
  new: '신규 신청',
  'api-keys': 'API Key 관리',
  reviews: '검토 목록',
  history: '검토 이력',
  admin: '관리',
  licenses: '라이센스 관리',
  monitoring: '사용 현황',
  settings: '설정',
  profile: '프로필',
  help: '도움말',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = ROUTE_LABELS[segment] || segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center hover:text-[#50CF94]"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </li>
            <li>
              {crumb.isLast ? (
                <span className="font-medium text-gray-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-[#50CF94]">
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
