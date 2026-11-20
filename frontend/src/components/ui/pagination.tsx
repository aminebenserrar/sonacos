import Link from "next/link";
import { PageSizeSelect } from "@/components/ui/page-size-select";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  label?: string;
  pageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  hrefForPageSize?: (pageSize: number) => string;
};

type PageItem = number | "ellipsis";

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(page), 1), Math.max(totalPages, 1));
}

function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 4) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis",
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    "ellipsis",
    totalPages,
  ];
}

export function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
  label = "Pagination",
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  hrefForPageSize,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = clampPage(currentPage, safeTotalPages);
  const safePageSize = pageSize && pageSize > 0 ? pageSize : undefined;
  const safeTotalItems = totalItems && totalItems > 0 ? totalItems : 0;
  const startItem =
    safePageSize && safeTotalItems > 0 ? (safeCurrentPage - 1) * safePageSize + 1 : 0;
  const endItem =
    safePageSize && safeTotalItems > 0
      ? Math.min(safeCurrentPage * safePageSize, safeTotalItems)
      : 0;
  const pageSizeHrefs =
    safePageSize && hrefForPageSize
      ? Object.fromEntries(pageSizeOptions.map((option) => [option, hrefForPageSize(option)]))
      : {};

  if (safeTotalPages <= 1) {
    return (
      <nav
        className="mt-5 flex flex-col gap-3 rounded-[16px] border border-line bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        aria-label={label}
      >
        <p className="text-sm text-muted">
          {safePageSize ? (
            <>
              {safeTotalItems > 0 ? `${startItem}-${endItem}` : "0"} sur {safeTotalItems} elements
            </>
          ) : (
            <>Page {safeCurrentPage} sur {safeTotalPages}</>
          )}
        </p>
        {safePageSize && hrefForPageSize ? (
          <PageSizeSelect value={safePageSize} options={pageSizeOptions} hrefs={pageSizeHrefs} />
        ) : null}
      </nav>
    );
  }

  const pageItems = buildPageItems(safeCurrentPage, safeTotalPages);
  const previousDisabled = safeCurrentPage === 1;
  const nextDisabled = safeCurrentPage === safeTotalPages;
  const navButtonClass =
    "inline-flex h-10 items-center justify-center rounded-full border border-line px-4 text-sm font-semibold text-brand-strong transition hover:border-brand hover:bg-brand-soft";
  const mobileButtonClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-line px-3 text-sm font-bold text-brand-strong transition hover:border-brand hover:bg-brand-soft";
  const pageButtonClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-line px-3 text-sm font-semibold text-brand-strong transition hover:border-brand hover:bg-brand-soft";
  const disabledClass = "cursor-not-allowed opacity-45";

  return (
    <nav
      className="mt-5 flex flex-col gap-3 rounded-[16px] border border-line bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label={label}
    >
      <p className="text-sm text-muted">
        {safePageSize ? (
          <>
            {startItem}-{endItem} sur {safeTotalItems} elements
            <span className="ml-2 text-xs">Page {safeCurrentPage} sur {safeTotalPages}</span>
          </>
        ) : (
          <>Page {safeCurrentPage} sur {safeTotalPages}</>
        )}
      </p>

      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {previousDisabled ? (
          <button
            type="button"
            className={`${navButtonClass} ${disabledClass}`}
            aria-label="Aller a la premiere page"
            disabled
          >
            Premiere
          </button>
        ) : (
          <Link
            href={hrefForPage(1)}
            scroll
            className={navButtonClass}
            aria-label="Aller a la premiere page"
          >
            Premiere
          </Link>
        )}

        {previousDisabled ? (
          <button
            type="button"
            className={`${navButtonClass} ${disabledClass}`}
            aria-label="Aller a la page precedente"
            disabled
          >
            Precedent
          </button>
        ) : (
          <Link
            href={hrefForPage(safeCurrentPage - 1)}
            scroll
            className={navButtonClass}
            aria-label="Aller a la page precedente"
          >
            Precedent
          </Link>
        )}

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 min-w-8 items-center justify-center text-sm font-semibold text-muted"
              aria-hidden="true"
            >
              ...
            </span>
          ) : item === safeCurrentPage ? (
            <span
              key={item}
              className={`${pageButtonClass} border-brand bg-brand text-white shadow-[0_8px_18px_rgba(28,91,62,0.18)]`}
              aria-current="page"
            >
              {item}
            </span>
          ) : (
            <Link
              key={item}
              href={hrefForPage(item)}
              scroll
              className={pageButtonClass}
              aria-label={`Aller a la page ${item}`}
            >
              {item}
            </Link>
          ),
        )}

        {nextDisabled ? (
          <button
            type="button"
            className={`${navButtonClass} ${disabledClass}`}
            aria-label="Aller a la page suivante"
            disabled
          >
            Suivant
          </button>
        ) : (
          <Link
            href={hrefForPage(safeCurrentPage + 1)}
            scroll
            className={navButtonClass}
            aria-label="Aller a la page suivante"
          >
            Suivant
          </Link>
        )}

        {nextDisabled ? (
          <button
            type="button"
            className={`${navButtonClass} ${disabledClass}`}
            aria-label="Aller a la derniere page"
            disabled
          >
            Derniere
          </button>
        ) : (
          <Link
            href={hrefForPage(safeTotalPages)}
            scroll
            className={navButtonClass}
            aria-label="Aller a la derniere page"
          >
            Derniere
          </Link>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 sm:hidden">
        {previousDisabled ? (
          <button
            type="button"
            className={`${mobileButtonClass} ${disabledClass}`}
            aria-label="Aller a la premiere page"
            disabled
          >
            |&lt;
          </button>
        ) : (
          <Link
            href={hrefForPage(1)}
            scroll
            className={mobileButtonClass}
            aria-label="Aller a la premiere page"
          >
            |&lt;
          </Link>
        )}

        {previousDisabled ? (
          <button
            type="button"
            className={`${mobileButtonClass} ${disabledClass}`}
            aria-label="Aller a la page precedente"
            disabled
          >
            &lt;
          </button>
        ) : (
          <Link
            href={hrefForPage(safeCurrentPage - 1)}
            scroll
            className={mobileButtonClass}
            aria-label="Aller a la page precedente"
          >
            &lt;
          </Link>
        )}

        <span
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-3 text-sm font-bold text-white"
          aria-current="page"
        >
          {safeCurrentPage}/{safeTotalPages}
        </span>

        {nextDisabled ? (
          <button
            type="button"
            className={`${mobileButtonClass} ${disabledClass}`}
            aria-label="Aller a la page suivante"
            disabled
          >
            &gt;
          </button>
        ) : (
          <Link
            href={hrefForPage(safeCurrentPage + 1)}
            scroll
            className={mobileButtonClass}
            aria-label="Aller a la page suivante"
          >
            &gt;
          </Link>
        )}

        {nextDisabled ? (
          <button
            type="button"
            className={`${mobileButtonClass} ${disabledClass}`}
            aria-label="Aller a la derniere page"
            disabled
          >
            &gt;|
          </button>
        ) : (
          <Link
            href={hrefForPage(safeTotalPages)}
            scroll
            className={mobileButtonClass}
            aria-label="Aller a la derniere page"
          >
            &gt;|
          </Link>
        )}
      </div>

      {safePageSize && hrefForPageSize ? (
        <PageSizeSelect value={safePageSize} options={pageSizeOptions} hrefs={pageSizeHrefs} />
      ) : null}
    </nav>
  );
}
