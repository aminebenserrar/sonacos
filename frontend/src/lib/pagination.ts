export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function parsePaginationPage(value: string | undefined) {
  const page = Number(value ?? "1");

  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
}

export function parsePaginationSize(value: string | undefined, defaultSize = DEFAULT_PAGE_SIZE) {
  const size = Number(value ?? String(defaultSize));

  if (!Number.isFinite(size) || size <= 0) {
    return defaultSize;
  }

  const normalizedSize = Math.min(Math.trunc(size), MAX_PAGE_SIZE);

  return PAGE_SIZE_OPTIONS.includes(normalizedSize) ? normalizedSize : defaultSize;
}
