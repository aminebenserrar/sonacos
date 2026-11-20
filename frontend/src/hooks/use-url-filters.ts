"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterValues = Record<string, string>;

type UseUrlFiltersOptions = {
  pageParams?: string[];
};

export function useUrlFilters<T extends FilterValues>(
  defaults: T,
  options: UseUrlFiltersOptions = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParams = options.pageParams ?? ["page"];

  const filters = useMemo(() => {
    const next = { ...defaults };

    Object.keys(defaults).forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        next[key as keyof T] = value as T[keyof T];
      }
    });

    return next;
  }, [defaults, searchParams]);

  function apply(nextFilters: T) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (!value || value === defaults[key]) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    pageParams.forEach((param) => params.delete(param));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setFilter(key: keyof T, value: string) {
    apply({
      ...filters,
      [key]: value,
    });
  }

  function resetFilters() {
    apply({ ...defaults });
  }

  const activeCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== defaults[key],
  ).length;

  return {
    filters,
    setFilter,
    resetFilters,
    activeCount,
  };
}
