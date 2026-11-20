"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UseClientPaginationOptions = {
  totalItems: number;
  pageSize?: number;
  resetKey?: string;
  pageParam?: string;
  sizeParam?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  maxPageSize?: number;
  storageKey?: string;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function parsePage(value: string | null) {
  const page = Number(value ?? "1");

  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
}

function parsePageSize(
  value: string | null,
  defaultPageSize: number,
  pageSizeOptions: number[],
  maxPageSize: number,
) {
  const size = Number(value ?? "");

  if (!Number.isFinite(size) || size <= 0) {
    return defaultPageSize;
  }

  const normalizedSize = Math.min(Math.trunc(size), maxPageSize);

  return pageSizeOptions.includes(normalizedSize) ? normalizedSize : defaultPageSize;
}

export function useClientPagination<T>(
  items: T[],
  {
    totalItems,
    pageSize,
    resetKey = "",
    pageParam = "page",
    sizeParam = "size",
    defaultPageSize = 20,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    maxPageSize = 100,
    storageKey = "sonacos-page-size",
  }: UseClientPaginationOptions,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedPageSize =
    pageSize ??
    parsePageSize(searchParams.get(sizeParam), defaultPageSize, pageSizeOptions, maxPageSize);
  const hasMounted = useRef(false);
  const totalPages = Math.max(Math.ceil(totalItems / resolvedPageSize), 1);
  const currentPage = Math.min(parsePage(searchParams.get(pageParam)), totalPages);

  const hrefForPage = useMemo(
    () => (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextPage = Math.min(Math.max(page, 1), totalPages);

      if (nextPage <= 1) {
        params.delete(pageParam);
      } else {
        params.set(pageParam, String(nextPage));
      }

      const query = params.toString();

      return query ? `${pathname}?${query}` : pathname;
    },
    [pageParam, pathname, searchParams, totalPages],
  );

  const hrefForPageSize = useMemo(
    () => (nextPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      const safePageSize = Math.min(Math.max(Math.trunc(nextPageSize), 1), maxPageSize);

      params.delete(pageParam);
      if (safePageSize === defaultPageSize) {
        params.delete(sizeParam);
      } else {
        params.set(sizeParam, String(safePageSize));
      }

      const query = params.toString();

      return query ? `${pathname}?${query}` : pathname;
    },
    [defaultPageSize, maxPageSize, pageParam, pathname, searchParams, sizeParam],
  );

  useEffect(() => {
    if (searchParams.get(sizeParam)) {
      return;
    }

    const storedSize = parsePageSize(
      window.localStorage.getItem(storageKey),
      defaultPageSize,
      pageSizeOptions,
      maxPageSize,
    );

    if (storedSize !== defaultPageSize) {
      const params = new URLSearchParams(window.location.search);
      params.delete(pageParam);
      params.set(sizeParam, String(storedSize));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [
    defaultPageSize,
    maxPageSize,
    pageParam,
    pageSizeOptions,
    pathname,
    router,
    searchParams,
    sizeParam,
    storageKey,
  ]);

  useEffect(() => {
    const urlPage = parsePage(searchParams.get(pageParam));

    if (urlPage > totalPages) {
      router.replace(hrefForPage(totalPages), { scroll: false });
    }
  }, [hrefForPage, pageParam, router, searchParams, totalPages]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const urlPage = parsePage(params.get(pageParam));

    if (urlPage !== 1) {
      params.delete(pageParam);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [pageParam, pathname, router, resetKey]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * resolvedPageSize;

    return items.slice(start, start + resolvedPageSize);
  }, [currentPage, items, resolvedPageSize]);

  return {
    currentPage,
    totalPages,
    pageSize: resolvedPageSize,
    totalItems,
    paginatedItems,
    hrefForPage,
    hrefForPageSize,
  };
}
