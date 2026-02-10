import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ITEMS_PER_PAGE } from '@/lib/constants';

export function usePagination() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || ITEMS_PER_PAGE;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const setSort = useCallback(
    (field: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sortBy === field) {
        params.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        params.set('sortBy', field);
        params.set('sortOrder', 'asc');
      }
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname, sortBy, sortOrder]
  );

  return useMemo(
    () => ({ page, limit, sortBy, sortOrder, setPage, setSort }),
    [page, limit, sortBy, sortOrder, setPage, setSort]
  );
}
