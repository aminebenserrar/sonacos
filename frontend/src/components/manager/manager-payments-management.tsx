"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { SearchInput } from "@/components/ui/search-input";
import { CreditCardIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatCurrency, formatDateShort, formatStatusLabel } from "@/lib/formatters";
import type { ApiErrorResponse } from "@/types/api";
import type { PaymentRecord } from "@/types/manager";

const PAYMENT_STATUSES = ["EN_ATTENTE", "VALIDE", "REFUSE", "REMBOURSE"] as const;

function getAllowedPaymentStatuses(currentStatus: string) {
  switch (currentStatus) {
    case "EN_ATTENTE":
      return ["EN_ATTENTE", "VALIDE", "REFUSE"];
    case "VALIDE":
      return ["VALIDE", "REMBOURSE"];
    default:
      return [currentStatus];
  }
}

type ManagerPaymentsManagementProps = {
  initialPayments: PaymentRecord[];
};

const PAYMENT_FILTER_DEFAULTS = {
  search: "",
  status: "TOUS",
};

export function ManagerPaymentsManagement({
  initialPayments,
}: ManagerPaymentsManagementProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [payments, setPayments] = useState(initialPayments);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(PAYMENT_FILTER_DEFAULTS);
  const { search: query, status: statusFilter } = filters;

  const filteredPayments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        payment.paymentReference.toLowerCase().includes(normalizedQuery) ||
        payment.clientFullName.toLowerCase().includes(normalizedQuery) ||
        payment.orderNumber.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "TOUS" || payment.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [payments, query, statusFilter]);
  const paymentPagination = useClientPagination(filteredPayments, {
    totalItems: filteredPayments.length,
    resetKey: `${query}|${statusFilter}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Paiements",
        value: String(payments.length).padStart(2, "0"),
        detail: "dossiers suivis",
        icon: "payments" as const,
      },
      {
        label: "Valides",
        value: String(
          payments.filter((payment) => payment.status === "VALIDE").length,
        ).padStart(2, "0"),
        detail: "encaissements confirmes",
        icon: "check" as const,
      },
      {
        label: "En attente",
        value: String(
          payments.filter((payment) => payment.status === "EN_ATTENTE").length,
        ).padStart(2, "0"),
        detail: "a confirmer",
        icon: "stock" as const,
      },
      {
        label: "Montant valide",
        value: formatCurrency(
          payments
            .filter((payment) => payment.status === "VALIDE")
            .reduce((sum, payment) => sum + payment.amount, 0),
        ),
        detail: "volume confirme",
        icon: "chart" as const,
      },
    ],
    [payments],
  );

  async function saveStatus(paymentId: number, status: string) {
    const currentPayment = payments.find((payment) => payment.id === paymentId);
    if (!currentPayment) {
      return;
    }

    if (
      (status === "REFUSE" || status === "REMBOURSE") &&
      !window.confirm(
        `Confirmer le changement du paiement ${currentPayment.paymentReference} vers ${formatStatusLabel(status).toLowerCase()} ?`,
      )
    ) {
      return;
    }

    setPendingId(paymentId);
    setError(null);

    try {
      const response = await fetch(`/api/manager/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as PaymentRecord | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Echec de mise a jour", description: message, type: "error" });
        return;
      }

      setPayments((current) =>
        current.map((payment) =>
          payment.id === paymentId ? (payload as PaymentRecord) : payment,
        ),
      );
      notify({
        title: "Paiement mis a jour",
        description: "Le statut du paiement a ete enregistre.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible de mettre a jour le paiement.");
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
          <h2 className="panel-title">Paiements recents</h2>
          <p className="panel-copy">
            Recherchez, filtrez et confirmez les paiements commerciaux.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <FilterBar
            resultLabel={`${filteredPayments.length} paiement${filteredPayments.length > 1 ? "s" : ""} trouve${filteredPayments.length > 1 ? "s" : ""}`}
            activeCount={activeCount}
            onReset={resetFilters}
          >
            <SearchInput
              value={query}
              onChange={(value) => setFilter("search", value)}
              placeholder="Rechercher par reference, commande ou client"
              label="Rechercher un paiement"
            />
            <FilterSelect
              label="Filtrer par statut"
              value={statusFilter}
              onChange={(value) => setFilter("status", value)}
              options={[
                { value: "TOUS", label: "Tous les statuts" },
                ...PAYMENT_STATUSES.map((status) => ({ value: status, label: formatStatusLabel(status) })),
              ]}
            />
          </FilterBar>
          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
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
            items={paymentPagination.paginatedItems}
            empty={
              <div className="rounded-[18px] border border-line bg-surface p-6">
                <EmptyState
                  icon={<CreditCardIcon className="h-5 w-5" />}
                  title="Aucun paiement trouve"
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
                        <th>Reference</th>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Mode</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentPagination.paginatedItems.map((payment) => {
                        const busy = pendingId === payment.id;
                        const allowedStatuses = getAllowedPaymentStatuses(payment.status);

                        return (
                          <tr key={payment.id}>
                            <td className="font-semibold">{payment.paymentReference}</td>
                            <td>{payment.orderNumber}</td>
                            <td>{payment.clientFullName}</td>
                            <td>{formatStatusLabel(payment.paymentMode)}</td>
                            <td>
                              {payment.paymentDate
                                ? formatDateShort(payment.paymentDate)
                                : "Non defini"}
                            </td>
                            <td className="table-amount">{formatCurrency(payment.amount)}</td>
                            <td>
                              <StatusBadge value={payment.status} />
                            </td>
                            <td>
                              <select
                                className="h-10 min-w-[160px] rounded-[10px] border border-line bg-white px-3 text-sm"
                                value={payment.status}
                                disabled={busy}
                                onChange={(event) => {
                                  const nextStatus = event.target.value;
                                  if (nextStatus !== payment.status) {
                                    saveStatus(payment.id, nextStatus);
                                  }
                                }}
                                aria-label={`Statut du paiement ${payment.paymentReference}`}
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
            renderMobileCard={(payment) => {
              const busy = pendingId === payment.id;
              const allowedStatuses = getAllowedPaymentStatuses(payment.status);

              return (
                <MobileDataCard
                  key={payment.id}
                  title={payment.paymentReference}
                  subtitle={`Commande ${payment.orderNumber}`}
                  badges={<StatusBadge value={payment.status} />}
                  fields={[
                    { label: "Client", value: payment.clientFullName },
                    { label: "Mode", value: formatStatusLabel(payment.paymentMode) },
                    {
                      label: "Date",
                      value: payment.paymentDate
                        ? formatDateShort(payment.paymentDate)
                        : "Non definie",
                    },
                    { label: "Montant", value: formatCurrency(payment.amount) },
                  ]}
                  actions={
                    <select
                      className="form-control mt-0 w-full"
                      value={payment.status}
                      disabled={busy}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        if (nextStatus !== payment.status) {
                          saveStatus(payment.id, nextStatus);
                        }
                      }}
                      aria-label={`Statut du paiement ${payment.paymentReference}`}
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
            currentPage={paymentPagination.currentPage}
            totalPages={paymentPagination.totalPages}
            pageSize={paymentPagination.pageSize}
            totalItems={paymentPagination.totalItems}
            hrefForPage={paymentPagination.hrefForPage}
            hrefForPageSize={paymentPagination.hrefForPageSize}
            label="Pagination des paiements"
          />
        </div>
      </div>
    </div>
  );
}
