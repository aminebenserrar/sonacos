"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { CheckCircleIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDateTime, formatStatusLabel } from "@/lib/formatters";
import type { ValidationOperation } from "@/types/validation";

type AuditeurValidationsOverviewProps = {
  initialValidations: ValidationOperation[];
};

const FILTER_DEFAULTS = {
  search: "",
  status: "TOUS",
  priority: "TOUTES",
};

export function AuditeurValidationsOverview({
  initialValidations,
}: AuditeurValidationsOverviewProps) {
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(FILTER_DEFAULTS);
  const { search: query, status: statusFilter, priority: priorityFilter } = filters;

  const filteredValidations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialValidations.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.targetReference.toLowerCase().includes(normalizedQuery) ||
        item.operationType.toLowerCase().includes(normalizedQuery) ||
        item.requesterFullName.toLowerCase().includes(normalizedQuery) ||
        formatStatusLabel(item.status).toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "TOUS" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "TOUTES" || item.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [initialValidations, priorityFilter, query, statusFilter]);

  const validationPagination = useClientPagination(filteredValidations, {
    totalItems: filteredValidations.length,
    resetKey: `${query}|${statusFilter}|${priorityFilter}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Validations",
        value: String(initialValidations.length).padStart(2, "0"),
        detail: "operations controlees",
        icon: "check" as const,
      },
      {
        label: "En attente",
        value: String(initialValidations.filter((item) => item.status === "EN_ATTENTE").length).padStart(2, "0"),
        detail: "a examiner",
        icon: "stock" as const,
      },
      {
        label: "Priorite haute",
        value: String(initialValidations.filter((item) => item.priority === "HAUTE").length).padStart(2, "0"),
        detail: "demandes prioritaires",
        icon: "chart" as const,
      },
      {
        label: "Refusees",
        value: String(initialValidations.filter((item) => item.status === "REFUSEE").length).padStart(2, "0"),
        detail: "avec motif saisi",
        icon: "stock" as const,
      },
    ],
    [initialValidations],
  );

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <div className="card p-5">
        <div className="panel-header">
          <h2 className="panel-title">Suivi des validations</h2>
          <p className="panel-copy">
            Consultez les operations soumises au responsable, leur priorite et la decision enregistree.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <FilterBar
            resultLabel={`${filteredValidations.length} validation${filteredValidations.length > 1 ? "s" : ""} trouve${filteredValidations.length > 1 ? "s" : ""}`}
            activeCount={activeCount}
            onReset={resetFilters}
          >
            <SearchInput
              value={query}
              onChange={(value) => setFilter("search", value)}
              placeholder="Rechercher par reference, demandeur ou statut"
              label="Rechercher une validation"
            />
            <FilterSelect
              label="Filtrer par statut"
              value={statusFilter}
              onChange={(value) => setFilter("status", value)}
              options={[
                { value: "TOUS", label: "Tous les statuts" },
                { value: "EN_ATTENTE", label: "En attente" },
                { value: "VALIDEE", label: "Validee" },
                { value: "REFUSEE", label: "Refusee" },
              ]}
            />
            <FilterSelect
              label="Filtrer par priorite"
              value={priorityFilter}
              onChange={(value) => setFilter("priority", value)}
              options={[
                { value: "TOUTES", label: "Toutes les priorites" },
                { value: "HAUTE", label: "Haute" },
                { value: "MOYENNE", label: "Moyenne" },
                { value: "NORMALE", label: "Normale" },
              ]}
            />
          </FilterBar>

          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
              ...(statusFilter !== "TOUS" ? [{ key: "status", label: "Statut", value: formatStatusLabel(statusFilter), onRemove: () => setFilter("status", "TOUS") }] : []),
              ...(priorityFilter !== "TOUTES" ? [{ key: "priority", label: "Priorite", value: formatStatusLabel(priorityFilter), onRemove: () => setFilter("priority", "TOUTES") }] : []),
            ]}
            onClear={resetFilters}
          />
        </div>

        <div className="table-shell mt-5">
          {filteredValidations.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CheckCircleIcon className="h-5 w-5" />}
                title="Aucun resultat trouve"
                description="Essayez de modifier votre recherche ou de reinitialiser les filtres."
              />
            </div>
          ) : (
            <div className="table-scroll">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Operation</th>
                    <th>Demandeur</th>
                    <th>Date</th>
                    <th>Priorite</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {validationPagination.paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.targetReference}</td>
                      <td>{item.operationType}</td>
                      <td>{item.requesterFullName}</td>
                      <td>{formatDateTime(item.requestedAt)}</td>
                      <td>
                        <StatusBadge value={item.priority} kind="priority" />
                      </td>
                      <td>
                        <StatusBadge value={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination
          currentPage={validationPagination.currentPage}
          totalPages={validationPagination.totalPages}
          pageSize={validationPagination.pageSize}
          totalItems={validationPagination.totalItems}
          hrefForPage={validationPagination.hrefForPage}
          hrefForPageSize={validationPagination.hrefForPageSize}
          label="Pagination des validations auditeur"
        />
      </div>
    </div>
  );
}
