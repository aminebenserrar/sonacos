"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { PackageIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDateTime, formatStatusLabel } from "@/lib/formatters";
import type { StockMovementRecord } from "@/types/manager";

type AuditeurStockOverviewProps = {
  initialMovements: StockMovementRecord[];
};

const MOVEMENT_TYPES = ["ENTREE", "SORTIE", "RESERVATION", "ANNULATION_RESERVATION", "AJUSTEMENT"];
const FILTER_DEFAULTS = {
  search: "",
  type: "TOUS",
};

export function AuditeurStockOverview({ initialMovements }: AuditeurStockOverviewProps) {
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(FILTER_DEFAULTS);
  const { search: query, type: movementType } = filters;

  const filteredMovements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialMovements.filter((movement) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        movement.productName.toLowerCase().includes(normalizedQuery) ||
        movement.productReference.toLowerCase().includes(normalizedQuery) ||
        movement.reason.toLowerCase().includes(normalizedQuery) ||
        formatStatusLabel(movement.movementType).toLowerCase().includes(normalizedQuery);
      const matchesType = movementType === "TOUS" || movement.movementType === movementType;

      return matchesQuery && matchesType;
    });
  }, [initialMovements, movementType, query]);

  const movementPagination = useClientPagination(filteredMovements, {
    totalItems: filteredMovements.length,
    resetKey: `${query}|${movementType}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Mouvements",
        value: String(initialMovements.length).padStart(2, "0"),
        detail: "historique observe",
        icon: "products" as const,
      },
      {
        label: "Sorties",
        value: String(initialMovements.filter((item) => item.movementType === "SORTIE").length).padStart(2, "0"),
        detail: "sorties de stock",
        icon: "stock" as const,
      },
      {
        label: "Entrees",
        value: String(initialMovements.filter((item) => item.movementType === "ENTREE").length).padStart(2, "0"),
        detail: "entrees de stock",
        icon: "check" as const,
      },
      {
        label: "Ajustements",
        value: String(initialMovements.filter((item) => item.movementType === "AJUSTEMENT").length).padStart(2, "0"),
        detail: "corrections internes",
        icon: "chart" as const,
      },
    ],
    [initialMovements],
  );

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <div className="card p-5">
        <div className="panel-header">
          <h2 className="panel-title">Historique des mouvements</h2>
          <p className="panel-copy">
            Verifiez les entrees, sorties, reservations et ajustements sans possibilite de modification.
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
              value={movementType}
              onChange={(value) => setFilter("type", value)}
              options={[
                { value: "TOUS", label: "Tous les types" },
                ...MOVEMENT_TYPES.map((type) => ({
                  value: type,
                  label: formatStatusLabel(type),
                })),
              ]}
            />
          </FilterBar>

          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
              ...(movementType !== "TOUS" ? [{ key: "type", label: "Type", value: formatStatusLabel(movementType), onRemove: () => setFilter("type", "TOUS") }] : []),
            ]}
            onClear={resetFilters}
          />
        </div>

        <div className="table-shell mt-5">
          {filteredMovements.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<PackageIcon className="h-5 w-5" />}
                title="Aucun resultat trouve"
                description="Essayez de modifier votre recherche ou de reinitialiser les filtres."
              />
            </div>
          ) : (
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
                        <div className="mt-1 text-sm text-muted">{movement.productReference}</div>
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
          )}
        </div>
        <Pagination
          currentPage={movementPagination.currentPage}
          totalPages={movementPagination.totalPages}
          pageSize={movementPagination.pageSize}
          totalItems={movementPagination.totalItems}
          hrefForPage={movementPagination.hrefForPage}
          hrefForPageSize={movementPagination.hrefForPageSize}
          label="Pagination du stock auditeur"
        />
      </div>
    </div>
  );
}
