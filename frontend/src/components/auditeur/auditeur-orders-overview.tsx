"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatCurrency, formatDateShort, formatStatusLabel } from "@/lib/formatters";
import type { ManagerOrder } from "@/types/manager";

type AuditeurOrdersOverviewProps = {
  initialOrders: ManagerOrder[];
};

const ORDER_STATUSES = [
  "EN_ATTENTE",
  "CONFIRMEE",
  "EN_PREPARATION",
  "PRETE",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
  "REFUSEE",
];
const FILTER_DEFAULTS = {
  search: "",
  status: "TOUS",
  payment: "TOUS",
};

export function AuditeurOrdersOverview({ initialOrders }: AuditeurOrdersOverviewProps) {
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(FILTER_DEFAULTS);
  const { search: query, status: statusFilter, payment: paymentFilter } = filters;

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialOrders.filter((order) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        order.clientFullName.toLowerCase().includes(normalizedQuery) ||
        formatStatusLabel(order.status).toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "TOUS" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "TOUS" ||
        (paymentFilter === "SANS_PAIEMENT" && order.paymentStatus == null) ||
        order.paymentStatus === paymentFilter;

      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [initialOrders, paymentFilter, query, statusFilter]);

  const orderPagination = useClientPagination(filteredOrders, {
    totalItems: filteredOrders.length,
    resetKey: `${query}|${statusFilter}|${paymentFilter}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Commandes",
        value: String(initialOrders.length).padStart(2, "0"),
        detail: "consultation en lecture seule",
        icon: "cart" as const,
      },
      {
        label: "En attente",
        value: String(initialOrders.filter((order) => order.status === "EN_ATTENTE").length).padStart(2, "0"),
        detail: "commandes non traitees",
        icon: "stock" as const,
      },
      {
        label: "Livrees",
        value: String(initialOrders.filter((order) => order.status === "LIVREE").length).padStart(2, "0"),
        detail: "commandes finalisees",
        icon: "check" as const,
      },
      {
        label: "Montant total",
        value: formatCurrency(initialOrders.reduce((sum, order) => sum + order.totalAmount, 0)),
        detail: "montant cumule observe",
        icon: "payments" as const,
      },
    ],
    [initialOrders],
  );

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <div className="card p-5">
        <div className="panel-header">
          <h2 className="panel-title">Suivi des commandes</h2>
          <p className="panel-copy">
            Consultez les commandes clients, leurs statuts et leurs paiements sans modifier les donnees.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <FilterBar
            resultLabel={`${filteredOrders.length} commande${filteredOrders.length > 1 ? "s" : ""} trouve${filteredOrders.length > 1 ? "s" : ""}`}
            activeCount={activeCount}
            onReset={resetFilters}
          >
            <SearchInput
              value={query}
              onChange={(value) => setFilter("search", value)}
              placeholder="Rechercher par numero, client ou statut"
              label="Rechercher une commande"
            />
            <FilterSelect
              label="Filtrer par statut"
              value={statusFilter}
              onChange={(value) => setFilter("status", value)}
              options={[
                { value: "TOUS", label: "Tous les statuts" },
                ...ORDER_STATUSES.map((status) => ({
                  value: status,
                  label: formatStatusLabel(status),
                })),
              ]}
            />
            <FilterSelect
              label="Filtrer par paiement"
              value={paymentFilter}
              onChange={(value) => setFilter("payment", value)}
              options={[
                { value: "TOUS", label: "Tous les paiements" },
                { value: "EN_ATTENTE", label: "En attente" },
                { value: "VALIDE", label: "Valide" },
                { value: "REFUSE", label: "Refuse" },
                { value: "REMBOURSE", label: "Rembourse" },
                { value: "SANS_PAIEMENT", label: "Sans paiement" },
              ]}
            />
          </FilterBar>

          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
              ...(statusFilter !== "TOUS" ? [{ key: "status", label: "Statut", value: formatStatusLabel(statusFilter), onRemove: () => setFilter("status", "TOUS") }] : []),
              ...(paymentFilter !== "TOUS" ? [{ key: "payment", label: "Paiement", value: formatStatusLabel(paymentFilter), onRemove: () => setFilter("payment", "TOUS") }] : []),
            ]}
            onClear={resetFilters}
          />
        </div>

        <div className="table-shell mt-5">
          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ClipboardIcon className="h-5 w-5" />}
                title="Aucun resultat trouve"
                description="Essayez de modifier votre recherche ou de reinitialiser les filtres."
              />
            </div>
          ) : (
            <div className="table-scroll">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Commande</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orderPagination.paginatedItems.map((order) => (
                    <tr key={order.id}>
                      <td className="font-semibold">{order.orderNumber}</td>
                      <td>{order.clientFullName}</td>
                      <td>{formatDateShort(order.createdAt)}</td>
                      <td className="table-amount">{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <StatusBadge value={order.paymentStatus ?? "EN_ATTENTE"} />
                      </td>
                      <td>
                        <StatusBadge value={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination
          currentPage={orderPagination.currentPage}
          totalPages={orderPagination.totalPages}
          pageSize={orderPagination.pageSize}
          totalItems={orderPagination.totalItems}
          hrefForPage={orderPagination.hrefForPage}
          hrefForPageSize={orderPagination.hrefForPageSize}
          label="Pagination des commandes auditeur"
        />
      </div>
    </div>
  );
}
