import Link from "next/link";
import type { Category } from "@/types/product";
import { SearchIcon, XIcon } from "@/components/ui/store-icons";

type CatalogToolbarProps = {
  categories: Category[];
  filters: {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    sortBy: string;
    sortDirection: "asc" | "desc";
    size?: number;
  };
};

function buildCatalogueHref(next: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(next).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();

  return query ? `/catalogue?${query}` : "/catalogue";
}

function categoryLabel(categories: Category[], id?: number) {
  return categories.find((category) => category.id === id)?.name ?? "";
}

export function CatalogToolbar({ categories, filters }: CatalogToolbarProps) {
  const values = {
    search: filters.search ?? "",
    categoryId: filters.categoryId ? String(filters.categoryId) : "",
    minPrice: filters.minPrice ? String(filters.minPrice) : "",
    maxPrice: filters.maxPrice ? String(filters.maxPrice) : "",
    available: filters.available ? "true" : undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    size: filters.size ? String(filters.size) : undefined,
  };
  const chips = [
    ...(values.search
      ? [
          {
            key: "search",
            label: "Recherche",
            value: values.search,
            href: buildCatalogueHref({ ...values, search: undefined }),
          },
        ]
      : []),
    ...(values.categoryId
      ? [
          {
            key: "category",
            label: "Categorie",
            value: categoryLabel(categories, filters.categoryId),
            href: buildCatalogueHref({ ...values, categoryId: undefined }),
          },
        ]
      : []),
    ...(values.available
      ? [
          {
            key: "available",
            label: "Stock",
            value: "En stock",
            href: buildCatalogueHref({ ...values, available: undefined }),
          },
        ]
      : []),
    ...(values.minPrice || values.maxPrice
      ? [
          {
            key: "price",
            label: "Prix",
            value: `${values.minPrice || "0"} - ${values.maxPrice || "max"} MAD`,
            href: buildCatalogueHref({ ...values, minPrice: undefined, maxPrice: undefined }),
          },
        ]
      : []),
  ];

  return (
    <form className="card p-5">
      {values.size ? <input type="hidden" name="size" value={values.size} /> : null}
      <div className="grid gap-3 lg:grid-cols-[minmax(320px,1.5fr)_220px_180px_180px]">
        <label
          htmlFor="catalog-search"
          className="flex h-12 min-w-0 items-center gap-3 rounded-[14px] border border-line bg-white px-4 shadow-[0_3px_12px_rgba(24,57,38,0.04)] transition hover:border-brand/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"
        >
          <span className="sr-only">Rechercher dans le catalogue</span>
          <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
          <input
            id="catalog-search"
            name="search"
            type="search"
            defaultValue={values.search}
            placeholder="Rechercher un produit ou une reference"
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-brand-strong outline-none placeholder:text-muted"
          />
        </label>

        <select
          id="categoryId"
          name="categoryId"
          defaultValue={values.categoryId}
          className="form-control mt-0 h-12"
          aria-label="Filtrer par categorie"
        >
          <option value="">Toutes les categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          id="sortBy"
          name="sortBy"
          defaultValue={values.sortBy}
          className="form-control mt-0 h-12"
          aria-label="Trier par"
        >
          <option value="name">Nom</option>
          <option value="price">Prix</option>
          <option value="createdAt">Date</option>
        </select>

        <select
          id="sortDirection"
          name="sortDirection"
          defaultValue={values.sortDirection}
          className="form-control mt-0 h-12"
          aria-label="Ordre de tri"
        >
          <option value="asc">Croissant</option>
          <option value="desc">Decroissant</option>
        </select>
      </div>

      <div className="mt-3 grid gap-3 rounded-[14px] border border-line bg-surface-strong/60 p-3 lg:grid-cols-[minmax(0,1fr)_170px_170px_auto] lg:items-center">
        <p className="text-sm font-semibold text-brand-strong">Fourchette de prix</p>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          step="1"
          defaultValue={values.minPrice}
          className="form-control mt-0 h-12"
          placeholder="Prix min"
          aria-label="Prix minimum"
        />
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          step="1"
          defaultValue={values.maxPrice}
          className="form-control mt-0 h-12"
          placeholder="Prix max"
          aria-label="Prix maximum"
        />
        <label className="flex h-12 items-center gap-3 rounded-[14px] border border-line bg-white px-4 text-sm font-semibold text-brand-strong">
          <input
            type="checkbox"
            name="available"
            value="true"
            defaultChecked={filters.available ?? false}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          En stock uniquement
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={chip.href}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand/15 bg-brand/6 px-3 py-1 text-xs font-semibold text-brand-strong"
              aria-label={`Supprimer le filtre ${chip.label}`}
            >
              {chip.label}: {chip.value}
              <XIcon className="h-3 w-3" />
            </Link>
          ))}
          {chips.length > 0 ? (
            <Link href="/catalogue" className="button-tertiary h-9 px-3 text-xs">
              Tout effacer
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="button-primary h-12">
            Filtrer
          </button>
          <Link href="/catalogue" className="button-secondary h-12">
            Reinitialiser
          </Link>
        </div>
      </div>
    </form>
  );
}
