"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import {
  EditIcon,
  MoreHorizontalIcon,
  PackageIcon,
  TrashIcon,
} from "@/components/ui/store-icons";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { getProductImage } from "@/lib/catalog-ui";
import { formatCurrency, formatStatusLabel } from "@/lib/formatters";
import type { ApiErrorResponse } from "@/types/api";
import type { Category, Product } from "@/types/product";

type ManagerProductsManagementProps = {
  initialProducts: Product[];
  categories: Category[];
};

const PRODUCT_FILTER_DEFAULTS = {
  search: "",
  category: "TOUTES",
  status: "TOUS",
};

function getProductStatus(product: Product) {
  if (!product.active) {
    return "INACTIF";
  }

  if (product.stockQuantity <= product.alertThreshold) {
    return "STOCK_FAIBLE";
  }

  return "ACTIF";
}

function readErrorMessage(payload: Product | ApiErrorResponse) {
  return "message" in payload && payload.message
    ? payload.message
    : "Impossible de modifier le produit.";
}

export function ManagerProductsManagement({
  initialProducts,
  categories,
}: ManagerProductsManagementProps) {
  const { notify } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(PRODUCT_FILTER_DEFAULTS);
  const { search: query, category: categoryFilter, status: statusFilter } = filters;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.reference.toLowerCase().includes(normalizedQuery) ||
        product.categoryName.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        categoryFilter === "TOUTES" || product.categoryName === categoryFilter;

      const matchesStatus =
        statusFilter === "TOUS" ||
        (statusFilter === "ACTIF" && product.active) ||
        (statusFilter === "INACTIF" && !product.active) ||
        (statusFilter === "STOCK_FAIBLE" &&
          product.stockQuantity <= product.alertThreshold) ||
        (statusFilter === "MIS_EN_AVANT" && product.featured);

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, query, categoryFilter, statusFilter]);
  const productPagination = useClientPagination(filteredProducts, {
    totalItems: filteredProducts.length,
    resetKey: `${query}|${categoryFilter}|${statusFilter}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Produits",
        value: String(products.length).padStart(2, "0"),
        detail: "references catalogue",
        icon: "products" as const,
      },
      {
        label: "Actifs",
        value: String(products.filter((product) => product.active).length).padStart(
          2,
          "0",
        ),
        detail: "visibles client",
        icon: "check" as const,
      },
      {
        label: "Mis en avant",
        value: String(products.filter((product) => product.featured).length).padStart(
          2,
          "0",
        ),
        detail: "accueil public",
        icon: "chart" as const,
      },
      {
        label: "Stock faible",
        value: String(
          products.filter((product) => product.stockQuantity <= product.alertThreshold)
            .length,
        ).padStart(2, "0"),
        detail: "a surveiller",
        icon: "stock" as const,
      },
    ],
    [products],
  );

  async function updateFlags(
    product: Product,
    next: { active?: boolean; featured?: boolean; removeImage?: boolean },
  ) {
    setPendingProductId(product.id);
    setError(null);

    try {
      const endpoint = next.removeImage
        ? `/api/manager/products/${product.id}/image`
        : `/api/manager/products/${product.id}/status`;
      const response = await fetch(endpoint, {
        method: next.removeImage ? "DELETE" : "PATCH",
        headers: next.removeImage ? undefined : { "Content-Type": "application/json" },
        body: next.removeImage
          ? undefined
          : JSON.stringify({
              active: next.active ?? product.active,
              featured: next.featured ?? product.featured,
            }),
      });

      const data = (await response.json()) as Product | ApiErrorResponse;
      if (!response.ok) {
        const message = readErrorMessage(data);
        setError(message);
        notify({ title: "Mise a jour impossible", description: message, type: "error" });
        return;
      }

      setProducts((current) =>
        current.map((item) => (item.id === product.id ? (data as Product) : item)),
      );
      notify({
        title: "Produit mis a jour",
        description: next.removeImage
          ? "L image du produit a ete supprimee."
          : "Les parametres du produit ont ete enregistres.",
        type: "success",
      });
    } catch {
      setError("Impossible de modifier le produit.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setPendingProductId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">Catalogue produits</p>
            <h2 className="panel-title mt-2">Produits</h2>
            <p className="panel-copy mt-2">
              Recherchez, filtrez et pilotez les references visibles dans le catalogue.
            </p>
          </div>
          <Link href="/gestionnaire/produits/nouveau" className="button-primary">
            + Ajouter un produit
          </Link>
        </div>

        <div className="mt-6 grid gap-3">
          <FilterBar
            resultLabel={`${filteredProducts.length} produit${filteredProducts.length > 1 ? "s" : ""} trouve${filteredProducts.length > 1 ? "s" : ""}`}
            activeCount={activeCount}
            onReset={resetFilters}
          >
            <SearchInput
              value={query}
              onChange={(value) => setFilter("search", value)}
              placeholder="Rechercher par nom, reference ou categorie"
              label="Rechercher un produit"
            />
            <FilterSelect
              label="Filtrer par categorie"
              value={categoryFilter}
              onChange={(value) => setFilter("category", value)}
              options={[
                { value: "TOUTES", label: "Toutes les categories" },
                ...categories.map((category) => ({ value: category.name, label: category.name })),
              ]}
            />
            <FilterSelect
              label="Filtrer par statut"
              value={statusFilter}
              onChange={(value) => setFilter("status", value)}
              options={[
                { value: "TOUS", label: "Tous les statuts" },
                { value: "ACTIF", label: "Actifs" },
                { value: "INACTIF", label: "Inactifs" },
                { value: "STOCK_FAIBLE", label: "Stock faible" },
                { value: "MIS_EN_AVANT", label: "Mis en avant" },
              ]}
            />
          </FilterBar>
          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
              ...(categoryFilter !== "TOUTES" ? [{ key: "category", label: "Categorie", value: categoryFilter, onRemove: () => setFilter("category", "TOUTES") }] : []),
              ...(statusFilter !== "TOUS" ? [{ key: "status", label: "Statut", value: formatStatusLabel(statusFilter), onRemove: () => setFilter("status", "TOUS") }] : []),
            ]}
            onClear={resetFilters}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-5">
          <ResponsiveRecords
            items={productPagination.paginatedItems}
            empty={
              <div className="rounded-[18px] border border-line bg-surface p-6">
                <EmptyState
                  icon={<PackageIcon className="h-5 w-5" />}
                  title="Aucun produit trouve"
                  description="Essayez de modifier la recherche ou les filtres."
                />
              </div>
            }
            desktop={
              <div className="table-shell">
                <div className="table-scroll">
                  <table className="table-base min-w-[980px]">
                    <colgroup>
                      <col className="w-[36%]" />
                      <col className="w-[18%]" />
                      <col className="w-[13%]" />
                      <col className="w-[12%]" />
                      <col className="w-[11%]" />
                      <col className="w-[10%]" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Categorie</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productPagination.paginatedItems.map((product) => {
                        const busy = pendingProductId === product.id;

                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px] border border-line bg-surface-strong">
                                  <Image
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    width={52}
                                    height={52}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-brand-strong">
                                    {product.name}
                                  </p>
                                  <p className="mt-1 truncate text-sm text-muted">
                                    {product.reference}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>{product.categoryName}</td>
                            <td className="whitespace-nowrap font-semibold text-brand-strong">
                              {formatCurrency(product.price)}
                            </td>
                            <td>
                              <p className="font-semibold text-brand-strong">
                                {product.stockQuantity}
                              </p>
                              <p className="mt-1 text-xs text-muted">
                                Seuil {product.alertThreshold}
                              </p>
                            </td>
                            <td>
                              <StatusBadge value={getProductStatus(product)} />
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/gestionnaire/produits/${product.id}/modifier`}
                                  className="button-secondary px-3"
                                >
                                  <EditIcon className="h-4 w-4" />
                                  Modifier
                                </Link>
                                <details className="relative">
                                  <summary className="icon-button list-none">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                  </summary>
                                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-[14px] border border-line bg-white p-2 shadow-[0_18px_38px_rgba(24,57,38,0.14)]">
                                    <Link
                                      href={`/gestionnaire/produits/${product.id}/modifier`}
                                      className="button-tertiary w-full justify-start"
                                    >
                                      Modifier
                                    </Link>
                                    <button
                                      type="button"
                                      className="button-tertiary w-full justify-start"
                                      disabled={busy}
                                      onClick={() =>
                                        updateFlags(product, { active: !product.active })
                                      }
                                    >
                                      {product.active ? "Desactiver" : "Activer"}
                                    </button>
                                    <button
                                      type="button"
                                      className="button-tertiary w-full justify-start"
                                      disabled={busy}
                                      onClick={() =>
                                        updateFlags(product, {
                                          featured: !product.featured,
                                        })
                                      }
                                    >
                                      {product.featured
                                        ? "Retirer de la une"
                                        : "Mettre en avant"}
                                    </button>
                                    {product.imageUrl ? (
                                      <button
                                        type="button"
                                        className="button-tertiary w-full justify-start text-danger hover:bg-danger/6"
                                        disabled={busy}
                                        onClick={() =>
                                          updateFlags(product, { removeImage: true })
                                        }
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                        Supprimer l image
                                      </button>
                                    ) : null}
                                  </div>
                                </details>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            }
            renderMobileCard={(product) => {
              const busy = pendingProductId === product.id;

              return (
                <MobileDataCard
                  key={product.id}
                  title={product.name}
                  subtitle={`${product.reference} - ${product.categoryName}`}
                  badges={
                    <>
                      <StatusBadge value={getProductStatus(product)} />
                      {product.featured ? <StatusBadge value="VALIDEE" /> : null}
                    </>
                  }
                  fields={[
                    { label: "Prix", value: formatCurrency(product.price) },
                    { label: "Stock", value: product.stockQuantity },
                    { label: "Seuil", value: product.alertThreshold },
                    { label: "Unite", value: product.unit },
                  ]}
                  actions={
                    <>
                      <Link
                        href={`/gestionnaire/produits/${product.id}/modifier`}
                        className="button-secondary px-3"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        className="button-tertiary px-3"
                        disabled={busy}
                        onClick={() => updateFlags(product, { active: !product.active })}
                      >
                        {product.active ? "Desactiver" : "Activer"}
                      </button>
                      <button
                        type="button"
                        className="button-tertiary px-3"
                        disabled={busy}
                        onClick={() =>
                          updateFlags(product, { featured: !product.featured })
                        }
                      >
                        {product.featured ? "Retirer" : "Mettre en avant"}
                      </button>
                    </>
                  }
                />
              );
            }}
          />
          <Pagination
            currentPage={productPagination.currentPage}
            totalPages={productPagination.totalPages}
            pageSize={productPagination.pageSize}
            totalItems={productPagination.totalItems}
            hrefForPage={productPagination.hrefForPage}
            hrefForPageSize={productPagination.hrefForPageSize}
            label="Pagination des produits"
          />
        </div>
      </section>
    </div>
  );
}
