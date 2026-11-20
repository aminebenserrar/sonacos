"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { SearchInput } from "@/components/ui/search-input";
import { CheckCircleIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDateTime, formatStatusLabel } from "@/lib/formatters";
import {
  formatValidationRequesterRole,
  formatValidationType,
  getDecisionLabel,
  getPriorityRank,
  getRelativeTimeLabel,
  getResponsableSummary,
  getValidationImpactLabel,
} from "@/lib/responsable-validations";
import type { ValidationOperation } from "@/types/validation";

type ResponsableValidationsManagementProps = {
  initialValidations: ValidationOperation[];
  responsableFirstName: string;
};

const VALIDATION_FILTER_DEFAULTS = {
  search: "",
  status: "TOUTES",
  priority: "TOUTES",
  type: "TOUS",
};

function isSameDay(value: string | null, reference: Date) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function ResponsableValidationsManagement({
  initialValidations,
  responsableFirstName,
}: ResponsableValidationsManagementProps) {
  const [validations] = useState(initialValidations);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(
    VALIDATION_FILTER_DEFAULTS,
    { pageParams: ["page", "decisionsPage"] },
  );
  const {
    search: query,
    status: statusFilter,
    priority: priorityFilter,
    type: typeFilter,
  } = filters;

  const filteredValidations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return validations.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.targetReference.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.requesterFullName.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "TOUTES" || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === "TOUTES" || item.priority === priorityFilter;
      const matchesType = typeFilter === "TOUS" || item.operationType === typeFilter;

      return matchesQuery && matchesStatus && matchesPriority && matchesType;
    });
  }, [priorityFilter, query, statusFilter, typeFilter, validations]);

  const pendingItems = useMemo(
    () =>
      filteredValidations
        .filter((item) => item.status === "EN_ATTENTE")
        .sort((left, right) => {
          const priorityGap = getPriorityRank(left.priority) - getPriorityRank(right.priority);
          if (priorityGap !== 0) {
            return priorityGap;
          }

          return (
            new Date(left.requestedAt).getTime() - new Date(right.requestedAt).getTime()
          );
        }),
    [filteredValidations],
  );

  const decidedItems = useMemo(
    () =>
      filteredValidations
        .filter((item) => item.status !== "EN_ATTENTE")
        .sort(
          (left, right) =>
            new Date(right.decidedAt ?? right.requestedAt).getTime() -
            new Date(left.decidedAt ?? left.requestedAt).getTime(),
        ),
    [filteredValidations],
  );
  const pendingPagination = useClientPagination(pendingItems, {
    totalItems: pendingItems.length,
    resetKey: `${query}|${statusFilter}|${priorityFilter}|${typeFilter}|pending`,
    pageParam: "page",
    sizeParam: "size",
  });
  const decidedPagination = useClientPagination(decidedItems, {
    totalItems: decidedItems.length,
    resetKey: `${query}|${statusFilter}|${priorityFilter}|${typeFilter}|decisions`,
    pageParam: "decisionsPage",
    sizeParam: "decisionsSize",
  });

  const today = new Date();
  const urgentPendingCount = validations.filter(
    (item) => item.status === "EN_ATTENTE" && item.priority === "HAUTE",
  ).length;
  const pendingCount = validations.filter((item) => item.status === "EN_ATTENTE").length;
  const validatedTodayCount = validations.filter(
    (item) => item.status === "VALIDEE" && isSameDay(item.decidedAt, today),
  ).length;
  const refusedTodayCount = validations.filter(
    (item) => item.status === "REFUSEE" && isSameDay(item.decidedAt, today),
  ).length;

  const metrics = [
    {
      label: "A traiter",
      value: String(pendingCount).padStart(2, "0"),
      detail: "demandes en attente de votre decision",
      icon: "check" as const,
    },
    {
      label: "Urgentes",
      value: String(urgentPendingCount).padStart(2, "0"),
      detail: "demandes prioritaires a examiner rapidement",
      icon: "stock" as const,
    },
    {
      label: "Validees aujourd hui",
      value: String(validatedTodayCount).padStart(2, "0"),
      detail: "decisions favorables enregistrees aujourd hui",
      icon: "chart" as const,
    },
    {
      label: "Refusees aujourd hui",
      value: String(refusedTodayCount).padStart(2, "0"),
      detail: "demandes refusees avec motif saisi",
      icon: "stock" as const,
    },
  ];

  const buildDetailHref = (id: number) =>
    `/responsable/validations/${id}?returnTo=${encodeURIComponent("/responsable/validations")}`;

  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <p className="eyebrow">Mon espace</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-heading text-3xl font-semibold text-brand-strong">
              Bonjour {responsableFirstName},
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {getResponsableSummary(pendingCount, urgentPendingCount)}
            </p>
          </div>
          <div className="rounded-[18px] border border-warning/20 bg-warning/8 px-4 py-3 text-sm text-brand-strong">
            <p className="font-semibold">Vue de pilotage</p>
            <p className="mt-1 text-muted">
              Priorisez les demandes urgentes puis relisez l historique des decisions.
            </p>
          </div>
        </div>
      </div>

      <MetricGrid items={metrics} />

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Demandes a traiter</h2>
          <p className="panel-copy">
            Commencez par les demandes en attente, comprenez leur impact puis ouvrez une
            page complete pour prendre votre decision.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <FilterBar
            resultLabel={`${filteredValidations.length} demande${filteredValidations.length > 1 ? "s" : ""} trouve${filteredValidations.length > 1 ? "s" : ""}`}
            activeCount={activeCount}
            onReset={resetFilters}
          >
            <SearchInput
              value={query}
              onChange={(value) => setFilter("search", value)}
              placeholder="Rechercher par reference, demandeur ou statut"
              label="Rechercher une demande de validation"
            />
            <FilterSelect
              label="Filtrer par statut"
              value={statusFilter}
              onChange={(value) => setFilter("status", value)}
              options={[
                { value: "TOUTES", label: "Tous les statuts" },
                { value: "EN_ATTENTE", label: "A traiter" },
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
                { value: "NORMALE", label: "Faible" },
              ]}
            />
            <FilterSelect
              label="Filtrer par type"
              value={typeFilter}
              onChange={(value) => setFilter("type", value)}
              options={[
                { value: "TOUS", label: "Tous les types" },
                { value: "STOCK", label: "Stock" },
                { value: "PAIEMENT", label: "Paiement" },
                { value: "COMMANDE", label: "Commande" },
                { value: "AUTRE", label: "Autre" },
              ]}
            />
          </FilterBar>
          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
              ...(statusFilter !== "TOUTES" ? [{ key: "status", label: "Statut", value: formatStatusLabel(statusFilter), onRemove: () => setFilter("status", "TOUTES") }] : []),
              ...(priorityFilter !== "TOUTES" ? [{ key: "priority", label: "Priorite", value: formatStatusLabel(priorityFilter), onRemove: () => setFilter("priority", "TOUTES") }] : []),
              ...(typeFilter !== "TOUS" ? [{ key: "type", label: "Type", value: formatValidationType(typeFilter), onRemove: () => setFilter("type", "TOUS") }] : []),
            ]}
            onClear={resetFilters}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                A traiter en priorite
              </p>
              <p className="mt-1 text-sm text-muted">
                Les demandes en attente apparaissent ici avec leur impact et leur niveau
                d urgence.
              </p>
            </div>
            {pendingItems.length > 0 ? (
              <StatusBadge value={pendingItems[0].priority} kind="priority" />
            ) : null}
          </div>

          <div className="mt-5">
            <ResponsiveRecords
              items={pendingPagination.paginatedItems}
              empty={
                <div className="rounded-[18px] border border-line bg-surface p-6">
                  <EmptyState
                    icon={<CheckCircleIcon className="h-5 w-5" />}
                    title="Tout est a jour"
                    description="Vous n'avez aucune demande a traiter pour le moment."
                  />
                </div>
              }
              desktop={
                <div className="table-shell">
                  <div className="table-scroll">
                    <table className="table-base">
                      <thead>
                        <tr>
                          <th>Demande</th>
                          <th>Impact</th>
                          <th>Demandeur</th>
                          <th>Priorite</th>
                          <th>Depuis</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPagination.paginatedItems.map((item) => (
                          <tr key={item.id}>
                            <td className="min-w-[280px]">
                              <div className="font-semibold text-brand-strong">
                                {formatValidationType(item.operationType)}
                              </div>
                              <div className="mt-1 text-sm text-muted">
                                {item.targetReference}
                              </div>
                            </td>
                            <td className="min-w-[240px] text-sm text-muted">
                              {getValidationImpactLabel(item)}
                            </td>
                            <td>
                              <div className="font-semibold text-brand-strong">
                                {item.requesterFullName}
                              </div>
                              <div className="mt-1 text-sm text-muted">
                                {item.requesterRole
                                  ? formatValidationRequesterRole(item.requesterRole)
                                  : "Role non renseigne"}
                              </div>
                            </td>
                            <td>
                              <StatusBadge value={item.priority} kind="priority" />
                            </td>
                            <td>{getRelativeTimeLabel(item.requestedAt)}</td>
                            <td>
                              <Link href={buildDetailHref(item.id)} className="button-secondary">
                                Examiner
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              }
              renderMobileCard={(item) => (
                <MobileDataCard
                  key={item.id}
                  title={formatValidationType(item.operationType)}
                  subtitle={item.targetReference}
                  badges={
                    <>
                      <StatusBadge value={item.priority} kind="priority" />
                      <StatusBadge value={item.status} />
                    </>
                  }
                  description={item.description}
                  fields={[
                    { label: "Impact", value: getValidationImpactLabel(item) },
                    { label: "Demandeur", value: item.requesterFullName },
                    {
                      label: "Role",
                      value: item.requesterRole
                        ? formatValidationRequesterRole(item.requesterRole)
                        : "Non renseigne",
                    },
                    { label: "Demande", value: getRelativeTimeLabel(item.requestedAt) },
                  ]}
                  actions={
                    <Link href={buildDetailHref(item.id)} className="button-secondary px-4">
                      Examiner
                    </Link>
                  }
                />
              )}
            />
            <Pagination
              currentPage={pendingPagination.currentPage}
              totalPages={pendingPagination.totalPages}
              pageSize={pendingPagination.pageSize}
              totalItems={pendingPagination.totalItems}
              hrefForPage={pendingPagination.hrefForPage}
              hrefForPageSize={pendingPagination.hrefForPageSize}
              label="Pagination des demandes a traiter"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Decisions deja prises</h2>
          <p className="panel-copy">
            Relisez rapidement les demandes deja validees ou refusees.
          </p>
        </div>

        <div className="mt-5">
          <ResponsiveRecords
            items={decidedPagination.paginatedItems}
            empty={
              <div className="rounded-[18px] border border-line bg-surface p-6">
                <EmptyState
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                  title="Aucune decision enregistree"
                  description="Les demandes validees ou refusees apparaitront ici."
                />
              </div>
            }
            desktop={
              <div className="grid gap-4">
                {decidedPagination.paginatedItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[18px] border border-line bg-white p-5 shadow-[0_10px_28px_rgba(24,57,38,0.05)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={item.status} />
                          <StatusBadge value={item.priority} kind="priority" />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-brand-strong">
                          {formatValidationType(item.operationType)}
                        </h3>
                        <p className="mt-1 text-sm text-muted">{item.targetReference}</p>
                        <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>

                        <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
                          <p>
                            <span className="font-semibold text-brand-strong">Demandeur :</span>{" "}
                            {item.requesterFullName}
                          </p>
                          <p>
                            <span className="font-semibold text-brand-strong">
                              Decision prise par :
                            </span>{" "}
                            {item.responsibleFullName}
                          </p>
                          <p>
                            <span className="font-semibold text-brand-strong">Decision :</span>{" "}
                            {getDecisionLabel(item)}
                          </p>
                          <p>
                            <span className="font-semibold text-brand-strong">Le :</span>{" "}
                            {formatDateTime(item.decidedAt ?? item.requestedAt)}
                          </p>
                        </div>

                        {item.rejectionReason ? (
                          <div className="mt-4 rounded-[14px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
                            Motif : {item.rejectionReason}
                          </div>
                        ) : null}
                      </div>

                      <Link href={buildDetailHref(item.id)} className="button-secondary">
                        Examiner
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            }
            renderMobileCard={(item) => (
              <MobileDataCard
                key={item.id}
                title={formatValidationType(item.operationType)}
                subtitle={item.targetReference}
                badges={
                  <>
                    <StatusBadge value={item.status} />
                    <StatusBadge value={item.priority} kind="priority" />
                  </>
                }
                description={item.description}
                fields={[
                  { label: "Demandeur", value: item.requesterFullName },
                  { label: "Decision", value: getDecisionLabel(item) },
                  {
                    label: "Date",
                    value: formatDateTime(item.decidedAt ?? item.requestedAt),
                  },
                  {
                    label: "Responsable",
                    value: item.responsibleFullName || "Non renseigne",
                  },
                ]}
                actions={
                  <Link href={buildDetailHref(item.id)} className="button-secondary px-4">
                    Examiner
                  </Link>
                }
              />
            )}
          />
          <Pagination
            currentPage={decidedPagination.currentPage}
            totalPages={decidedPagination.totalPages}
            pageSize={decidedPagination.pageSize}
            totalItems={decidedPagination.totalItems}
            hrefForPage={decidedPagination.hrefForPage}
            hrefForPageSize={decidedPagination.hrefForPageSize}
            label="Pagination des decisions"
          />
        </div>
      </div>
    </div>
  );
}
