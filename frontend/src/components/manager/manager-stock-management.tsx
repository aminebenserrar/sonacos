"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { SearchInput } from "@/components/ui/search-input";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDateTime } from "@/lib/formatters";
import type { ApiErrorResponse } from "@/types/api";
import type { StockMovementRecord } from "@/types/manager";
import type { Product } from "@/types/product";

const MOVEMENT_TYPES = [
  "ENTREE",
  "SORTIE",
  "RESERVATION",
  "ANNULATION_RESERVATION",
  "AJUSTEMENT",
] as const;

type ManagerStockManagementProps = {
  initialMovements: StockMovementRecord[];
  products: Product[];
};

const STOCK_FILTER_DEFAULTS = {
  search: "",
  type: "TOUS",
};

export function ManagerStockManagement({
  initialMovements,
  products,
}: ManagerStockManagementProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [movements, setMovements] = useState(initialMovements);
  const [form, setForm] = useState({
    productId: products[0]?.id?.toString() ?? "",
    movementType: "ENTREE",
    quantity: "1",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(STOCK_FILTER_DEFAULTS);
  const { search: query, type: typeFilter } = filters;
  const filteredMovements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return movements.filter((movement) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        movement.productName.toLowerCase().includes(normalizedQuery) ||
        movement.productReference.toLowerCase().includes(normalizedQuery) ||
        movement.reason.toLowerCase().includes(normalizedQuery) ||
        movement.movementType.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "TOUS" || movement.movementType === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [movements, query, typeFilter]);

  const metrics = useMemo(
    () => [
      {
        label: "Mouvements",
        value: String(movements.length).padStart(2, "0"),
        detail: "historique stock",
        icon: "products" as const,
      },
      {
        label: "Sorties",
        value: String(
          movements.filter((movement) => movement.movementType === "SORTIE").length,
        ).padStart(2, "0"),
        detail: "sorties enregistrees",
        icon: "stock" as const,
      },
      {
        label: "Reservations",
        value: String(
          movements.filter((movement) => movement.movementType === "RESERVATION")
            .length,
        ).padStart(2, "0"),
        detail: "liees aux commandes",
        icon: "chart" as const,
      },
      {
        label: "Ajustements",
        value: String(
          movements.filter((movement) => movement.movementType === "AJUSTEMENT")
            .length,
        ).padStart(2, "0"),
        detail: "corrections internes",
        icon: "check" as const,
      },
    ],
    [movements],
  );
  const movementPagination = useClientPagination(filteredMovements, {
    totalItems: filteredMovements.length,
    resetKey: `${query}|${typeFilter}`,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/manager/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(form.productId),
          movementType: form.movementType,
          quantity: Number(form.quantity),
          reason: form.reason,
        }),
      });

      const payload = (await response.json()) as
        | StockMovementRecord
        | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Enregistrement impossible", description: message, type: "error" });
        return;
      }

      setMovements((current) => [payload as StockMovementRecord, ...current]);
      setForm((current) => ({ ...current, quantity: "1", reason: "" }));
      notify({
        title: "Mouvement enregistre",
        description: "Le mouvement de stock a bien ete ajoute.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer le mouvement de stock.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="card p-6">
          <div className="panel-header">
            <h2 className="panel-title">Nouveau mouvement</h2>
            <p className="panel-copy">
              Enregistrez une entree, une sortie, une reservation ou un ajustement.
            </p>
          </div>

          {error ? (
            <div className="mt-4 rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="text-sm font-semibold text-brand-strong">
              Produit
              <select
                className="form-control"
                value={form.productId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, productId: event.target.value }))
                }
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.reference} - {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Type de mouvement
              <select
                className="form-control"
                value={form.movementType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    movementType: event.target.value,
                  }))
                }
              >
                {MOVEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Quantite
              <input
                className="form-control"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, quantity: event.target.value }))
                }
              />
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Motif
              <textarea
                className="form-control min-h-[110px] py-3"
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reason: event.target.value }))
                }
              />
            </label>

            <button
              type="submit"
              className="button-primary w-full"
              disabled={submitting}
            >
              {submitting ? "Enregistrement..." : "Enregistrer le mouvement"}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <div className="panel-header">
            <h2 className="panel-title">Historique recent</h2>
            <p className="panel-copy">
              Suivez les derniers changements de stock par produit.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <FilterBar
              resultLabel={`${filteredMovements.length} mouvement${filteredMovements.length > 1 ? "s" : ""} trouve${filteredMovements.length > 1 ? "s" : ""}`}
              activeCount={activeCount}
              onReset={resetFilters}
            >
              <SearchInput
                value={query}
                onChange={(value) => setFilter("search", value)}
                placeholder="Rechercher un produit ou une reference"
                label="Rechercher un mouvement de stock"
              />
              <FilterSelect
                label="Filtrer par type"
                value={typeFilter}
                onChange={(value) => setFilter("type", value)}
                options={[
                  { value: "TOUS", label: "Tous les types" },
                  ...MOVEMENT_TYPES.map((type) => ({ value: type, label: type })),
                ]}
              />
            </FilterBar>
            <ActiveFilterChips
              chips={[
                ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
                ...(typeFilter !== "TOUS" ? [{ key: "type", label: "Type", value: typeFilter, onRemove: () => setFilter("type", "TOUS") }] : []),
              ]}
              onClear={resetFilters}
            />
          </div>

          <div className="mt-5">
            <ResponsiveRecords
              items={filteredMovements}
              empty={
                <div className="rounded-[18px] border border-line bg-surface p-6">
                  <EmptyState
                    icon={<ClipboardIcon className="h-5 w-5" />}
                    title="Aucun mouvement enregistre"
                    description="Les nouveaux mouvements de stock apparaitront ici."
                  />
                </div>
              }
              desktop={
                <div className="table-shell">
                  <div className="table-scroll">
                    <table className="table-base">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Type</th>
                          <th>Quantite</th>
                          <th>Avant</th>
                          <th>Apres</th>
                          <th>Date</th>
                          <th>Motif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movementPagination.paginatedItems.map((movement) => (
                          <tr key={movement.id}>
                            <td>
                              <div className="font-semibold">{movement.productName}</div>
                              <div className="mt-1 text-sm text-muted">
                                {movement.productReference}
                              </div>
                            </td>
                            <td>
                              <StatusBadge value={movement.movementType} />
                            </td>
                            <td>{movement.quantity}</td>
                            <td>{movement.stockBefore}</td>
                            <td>{movement.stockAfter}</td>
                            <td>{formatDateTime(movement.createdAt)}</td>
                            <td className="text-muted">{movement.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              }
              renderMobileCard={(movement) => (
                <MobileDataCard
                  key={movement.id}
                  badges={<StatusBadge value={movement.movementType} />}
                  title={movement.productName}
                  subtitle={movement.productReference}
                  description={movement.reason}
                  fields={[
                    { label: "Quantite", value: movement.quantity },
                    { label: "Stock", value: `${movement.stockBefore} -> ${movement.stockAfter}` },
                    { label: "Date", value: formatDateTime(movement.createdAt) },
                  ]}
                />
              )}
            />
            <Pagination
              currentPage={movementPagination.currentPage}
              totalPages={movementPagination.totalPages}
              pageSize={movementPagination.pageSize}
              totalItems={movementPagination.totalItems}
              hrefForPage={movementPagination.hrefForPage}
              hrefForPageSize={movementPagination.hrefForPageSize}
              label="Pagination des mouvements de stock"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
