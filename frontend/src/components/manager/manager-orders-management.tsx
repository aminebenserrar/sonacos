"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { formatCurrency, formatDateShort, formatStatusLabel } from "@/lib/formatters";
import type { ApiErrorResponse } from "@/types/api";
import type { ManagerOrder } from "@/types/manager";

const ORDER_STATUSES = [
  "EN_ATTENTE",
  "CONFIRMEE",
  "EN_PREPARATION",
  "PRETE",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
  "REFUSEE",
] as const;

function getAllowedOrderStatuses(currentStatus: string) {
  switch (currentStatus) {
    case "EN_ATTENTE":
      return ["EN_ATTENTE", "CONFIRMEE", "ANNULEE", "REFUSEE"];
    case "CONFIRMEE":
      return ["CONFIRMEE", "EN_PREPARATION", "ANNULEE", "REFUSEE"];
    case "EN_PREPARATION":
      return ["EN_PREPARATION", "PRETE", "ANNULEE", "REFUSEE"];
    case "PRETE":
      return ["PRETE", "EXPEDIEE", "LIVREE", "ANNULEE", "REFUSEE"];
    case "EXPEDIEE":
      return ["EXPEDIEE", "LIVREE"];
    default:
      return [currentStatus];
  }
}

type ManagerOrdersManagementProps = {
  initialOrders: ManagerOrder[];
};

const ORDER_FILTER_DEFAULTS = {
  search: "",
  status: "TOUS",
  payment: "TOUS",
};

export function ManagerOrdersManagement({
  initialOrders,
}: ManagerOrdersManagementProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(ORDER_FILTER_DEFAULTS);
  const { search: query, status: statusFilter, payment: paymentFilter } = filters;

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
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
  }, [orders, paymentFilter, query, statusFilter]);
  const orderPagination = useClientPagination(filteredOrders, {
    totalItems: filteredOrders.length,
    resetKey: `${query}|${statusFilter}|${paymentFilter}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Commandes",
        value: String(orders.length).padStart(2, "0"),
        detail: "dossiers suivis",
        icon: "cart" as const,
      },
      {
        label: "En preparation",
        value: String(
          orders.filter((order) => order.status === "EN_PREPARATION").length,
        ).padStart(2, "0"),
        detail: "preparation logistique",
        icon: "stock" as const,
      },
      {
        label: "Livrees",
        value: String(
          orders.filter((order) => order.status === "LIVREE").length,
        ).padStart(2, "0"),
        detail: "commandes finalisees",
        icon: "check" as const,
      },
      {
        label: "Montant total",
        value: formatCurrency(
          orders.reduce((sum, order) => sum + order.totalAmount, 0),
        ),
        detail: "volume suivi",
        icon: "payments" as const,
      },
    ],
    [orders],
  );

  async function saveStatus(orderId: number, status: string) {
    setPendingId(orderId);
    setError(null);

    try {
      const response = await fetch(`/api/manager/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as ManagerOrder | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Echec de mise a jour", description: message, type: "error" });
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? (payload as ManagerOrder) : order,
        ),
      );
      notify({
        title: "Commande mise a jour",
        description: "Le statut de la commande a ete enregistre.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible de mettre a jour la commande.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">File des commandes</h2>
          <p className="panel-copy">
            Recherchez, filtrez et mettez a jour les commandes clients sans quitter
            cet ecran.
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
                ...ORDER_STATUSES.map((status) => ({ value: status, label: formatStatusLabel(status) })),
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

        {error ? (
          <div className="mt-4 rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-5">
          <ResponsiveRecords
            items={orderPagination.paginatedItems}
            empty={
              <div className="rounded-[18px] border border-line bg-surface p-6">
                <EmptyState
                  icon={<ClipboardIcon className="h-5 w-5" />}
                  title="Aucune commande trouvee"
                  description="Essayez de modifier votre recherche ou vos filtres."
                />
              </div>
            }
            desktop={
              <div className="table-shell">
                <div className="table-scroll">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Paiement</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderPagination.paginatedItems.map((order) => {
                        const busy = pendingId === order.id;
                        const allowedStatuses = getAllowedOrderStatuses(order.status);

                        return (
                          <tr key={order.id}>
                            <td>
                              <div className="font-semibold">{order.orderNumber}</div>
                            </td>
                            <td>{order.clientFullName}</td>
                            <td>{formatDateShort(order.createdAt)}</td>
                            <td className="table-amount">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td>
                              <StatusBadge value={order.paymentStatus ?? "EN_ATTENTE"} />
                            </td>
                            <td>
                              <StatusBadge value={order.status} />
                            </td>
                            <td>
                              <select
                                className="h-11 min-w-[170px] rounded-[12px] border border-line bg-white px-3 text-sm"
                                value={order.status}
                                disabled={busy}
                                onChange={(event) => {
                                  const nextStatus = event.target.value;
                                  if (nextStatus !== order.status) {
                                    saveStatus(order.id, nextStatus);
                                  }
                                }}
                                aria-label={`Statut de ${order.orderNumber}`}
                              >
                                {allowedStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {formatStatusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            }
            renderMobileCard={(order) => {
              const busy = pendingId === order.id;
              const allowedStatuses = getAllowedOrderStatuses(order.status);

              return (
                <MobileDataCard
                  key={order.id}
                  badges={
                    <>
                      <StatusBadge value={order.status} />
                      <StatusBadge value={order.paymentStatus ?? "EN_ATTENTE"} />
                    </>
                  }
                  title={order.orderNumber}
                  subtitle={order.clientFullName}
                  fields={[
                    { label: "Date", value: formatDateShort(order.createdAt) },
                    { label: "Montant", value: formatCurrency(order.totalAmount) },
                    {
                      label: "Paiement",
                      value: formatStatusLabel(order.paymentStatus ?? "EN_ATTENTE"),
                    },
                  ]}
                  actions={
                    <select
                      className="form-control mt-0"
                      value={order.status}
                      disabled={busy}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        if (nextStatus !== order.status) {
                          saveStatus(order.id, nextStatus);
                        }
                      }}
                      aria-label={`Statut de ${order.orderNumber}`}
                    >
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  }
                />
              );
            }}
          />
          <Pagination
            currentPage={orderPagination.currentPage}
            totalPages={orderPagination.totalPages}
            pageSize={orderPagination.pageSize}
            totalItems={orderPagination.totalItems}
            hrefForPage={orderPagination.hrefForPage}
            hrefForPageSize={orderPagination.hrefForPageSize}
            label="Pagination des commandes"
          />
        </div>
      </div>
    </div>
  );
}
