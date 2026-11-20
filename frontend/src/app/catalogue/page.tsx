import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { CatalogHero } from "@/components/catalog/catalog-hero";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductCard } from "@/components/catalog/product-card";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/store/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PackageIcon } from "@/components/ui/store-icons";
import { getPublicCategories, getPublicProducts } from "@/lib/api/catalog";
import { parsePaginationPage, parsePaginationSize } from "@/lib/pagination";

type CataloguePageProps = {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    available?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: string;
    size?: string;
  }>;
};

export const dynamic = "force-dynamic";

function buildPageHref(
  page: number,
  filters: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set("page", String(page));

  return `/catalogue?${params.toString()}`;
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const params = await searchParams;
  const currentPage = parsePaginationPage(params.page);
  const pageSize = parsePaginationSize(params.size);
  const search = params.search?.trim() || undefined;
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const available = params.available === "true";
  const sortBy = params.sortBy ?? "name";
  const sortDirection = params.sortDirection ?? "asc";

  let categories: Awaited<ReturnType<typeof getPublicCategories>> | null = null;
  let productsResponse: Awaited<ReturnType<typeof getPublicProducts>> | null = null;

  const [categoriesResult, productsResult] = await Promise.allSettled([
    getPublicCategories(),
    getPublicProducts({
      search,
      categoryId,
      minPrice,
      maxPrice,
      available,
      sortBy,
      sortDirection,
      page: Math.max(currentPage - 1, 0),
      size: pageSize,
    }),
  ]);

  if (categoriesResult.status === "fulfilled") {
    categories = categoriesResult.value;
  }

  if (productsResult.status === "fulfilled") {
    productsResponse = productsResult.value;
  }

  const filters = {
    search: search ?? "",
    categoryId: params.categoryId,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    available: available ? "true" : undefined,
    sortBy,
    sortDirection,
    size: pageSize === 20 ? undefined : String(pageSize),
  };

  return (
    <PublicShell>
      <CatalogHero
        productCount={productsResponse?.totalElements ?? 0}
        categoryCount={categories?.length ?? 0}
      />

      <section className="page-shell pb-10">
        <SectionHeading eyebrow="boutique" title="Produits disponibles" />

        <div className="mt-6 grid gap-5">
          {categories ? (
            <CatalogToolbar
              categories={categories}
              filters={{
                search,
                categoryId,
                minPrice,
                maxPrice,
                available,
                sortBy,
                sortDirection,
                size: pageSize === 20 ? undefined : pageSize,
              }}
            />
          ) : (
            <DataLoadAlert
              description="Les categories du catalogue n'ont pas pu etre chargees. La consultation reste disponible sans filtres."
              retryHref="/catalogue"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-white px-5 py-3 text-sm text-muted shadow-[0_6px_20px_rgba(24,57,38,0.05)]">
            <p>
              <span className="font-bold text-brand-strong">
                {productsResponse?.totalElements ?? 0}
              </span>{" "}
              produits disponibles
            </p>
            <div className="rounded-full border border-line bg-surface-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
              Catalogue SONACOS
            </div>
          </div>

          {productsResponse ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {productsResponse.content.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {productsResponse.content.length === 0 ? (
                <EmptyState
                  icon={<PackageIcon className="h-5 w-5" />}
                  title="Aucun produit trouve"
                  description="Essayez d ajuster votre recherche ou de modifier les filtres pour afficher d autres references."
                />
              ) : null}

              <Pagination
                currentPage={productsResponse.page + 1}
                totalPages={productsResponse.totalPages}
                pageSize={productsResponse.size}
                totalItems={productsResponse.totalElements}
                hrefForPage={(page) => buildPageHref(page, filters)}
                hrefForPageSize={(size) =>
                  buildPageHref(1, { ...filters, size: size === 20 ? undefined : String(size) })
                }
                label="Pagination du catalogue"
              />
            </>
          ) : (
            <div className="rounded-[16px] border border-danger/20 bg-danger/8 px-5 py-10 text-center text-sm text-danger">
              Impossible de charger le catalogue pour le moment.
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
