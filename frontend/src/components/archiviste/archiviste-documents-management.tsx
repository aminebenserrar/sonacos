"use client";

import Link from "next/link";
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
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatCurrency, formatDateLong, formatDateShort, formatStatusLabel } from "@/lib/formatters";
import type { ArchiveDocument } from "@/types/archive";

type ArchivisteDocumentsManagementProps = {
  initialDocuments: ArchiveDocument[];
  initialTab?: "all" | "archived" | "pending";
  scope?: "all" | "factures" | "archives";
};

const DOCUMENT_FILTER_DEFAULTS = {
  search: "",
  status: "TOUS",
};

export function ArchivisteDocumentsManagement({
  initialDocuments,
  initialTab = "all",
  scope = "all",
}: ArchivisteDocumentsManagementProps) {
  const { notify } = useToast();
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<ArchiveDocument | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters({
    ...DOCUMENT_FILTER_DEFAULTS,
    status:
      initialTab === "archived"
        ? "ARCHIVE"
        : initialTab === "pending"
          ? "A_ARCHIVER"
          : "TOUS",
  });
  const { search: query, status: statusFilter } = filters;

  function getDownloadUrl(documentId: number) {
    return `/api/archiviste/documents/${documentId}/download`;
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        document.documentNumber.toLowerCase().includes(normalizedQuery) ||
        document.orderNumber.toLowerCase().includes(normalizedQuery) ||
        document.clientFullName.toLowerCase().includes(normalizedQuery) ||
        document.documentType.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "TOUS" ||
        (statusFilter === "ARCHIVE" && document.archived) ||
        (statusFilter === "A_ARCHIVER" && !document.archived);

      const matchesScope =
        scope === "all" ||
        (scope === "factures" && document.documentType === "FACTURE") ||
        (scope === "archives" && document.archived);

      return matchesQuery && matchesStatus && matchesScope;
    });
  }, [documents, query, scope, statusFilter]);
  const documentPagination = useClientPagination(filteredDocuments, {
    totalItems: filteredDocuments.length,
    resetKey: `${query}|${statusFilter}|${scope}`,
  });

  async function handleArchive(documentId: number) {
    const confirmed = window.confirm(
      "Archiver ce document ? Il restera consultable apres archivage.",
    );

    if (!confirmed) {
      return;
    }

    setPendingId(documentId);

    try {
      const response = await fetch(`/api/archiviste/documents/${documentId}/archive`, {
        method: "PATCH",
      });
      const payload = (await response.json()) as ArchiveDocument | { message?: string };

      if (!response.ok) {
        notify({
          title: "Archivage impossible",
          description: "Le document n'a pas pu etre archive.",
          type: "error",
        });
        return;
      }

      const updated = payload as ArchiveDocument;
      setDocuments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedDocument((current) => (current?.id === updated.id ? updated : current));
      notify({
        title: "Document archive avec succes.",
        type: "success",
      });
    } catch {
      notify({
        title: "Archivage impossible",
        description: "Une erreur est survenue pendant l'archivage.",
        type: "error",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          href="/archiviste/documents"
          className={statusFilter === "TOUS" ? "button-primary" : "button-secondary"}
        >
          Tous
        </Link>
        <Link
          href="/archiviste/documents?tab=pending"
          className={statusFilter === "A_ARCHIVER" ? "button-primary" : "button-secondary"}
        >
          A archiver
        </Link>
        <Link
          href="/archiviste/documents?tab=archived"
          className={statusFilter === "ARCHIVE" ? "button-primary" : "button-secondary"}
        >
          Archives
        </Link>
      </div>

      <div className="grid gap-3">
        <FilterBar
          resultLabel={`${filteredDocuments.length} document${filteredDocuments.length > 1 ? "s" : ""} trouve${filteredDocuments.length > 1 ? "s" : ""}`}
          activeCount={activeCount}
          onReset={resetFilters}
        >
          <SearchInput
            value={query}
            onChange={(value) => setFilter("search", value)}
            placeholder={scope === "archives" ? "Rechercher une archive ou un document" : "Rechercher par titre, reference ou type"}
            label="Rechercher un document"
          />
          <FilterSelect
            label="Filtrer par statut"
            value={statusFilter}
            onChange={(value) => setFilter("status", value)}
            options={[
              { value: "TOUS", label: "Tous les statuts" },
              { value: "A_ARCHIVER", label: "A archiver" },
              { value: "ARCHIVE", label: "Archive" },
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

      <div className="mt-5">
        <ResponsiveRecords
          items={documentPagination.paginatedItems}
          empty={
            <div className="rounded-[18px] border border-line bg-surface p-6">
              <EmptyState
                icon={<ClipboardIcon className="h-5 w-5" />}
                title={initialTab === "archived" ? "Aucune archive" : "Aucun document"}
                description={
                  initialTab === "archived"
                    ? "Tous les documents disponibles ne sont pas encore classes."
                    : "Aucun document ne correspond a votre recherche."
                }
              />
            </div>
          }
          desktop={
            <div className="table-shell">
              <div className="table-scroll">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Commande</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentPagination.paginatedItems.map((document) => (
                      <tr key={document.id}>
                        <td className="font-semibold">{`${document.documentType} ${document.documentNumber}`}</td>
                        <td>{document.documentNumber}</td>
                        <td>{document.documentType}</td>
                        <td>{document.orderNumber}</td>
                        <td>{formatDateShort(document.generatedAt)}</td>
                        <td>{document.clientFullName}</td>
                        <td>
                          <StatusBadge value={document.archived ? "ARCHIVE" : "A_ARCHIVER"} />
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="button-secondary px-4"
                              onClick={() => setSelectedDocument(document)}
                            >
                              Consulter
                            </button>
                            <a
                              href={getDownloadUrl(document.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="button-secondary px-4"
                            >
                              Telecharger
                            </a>
                            {!document.archived ? (
                              <button
                                type="button"
                                className="button-primary px-4"
                                disabled={pendingId === document.id}
                                onClick={() => handleArchive(document.id)}
                              >
                                {pendingId === document.id ? "Archivage..." : "Archiver"}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }
          renderMobileCard={(document) => (
            <MobileDataCard
              key={document.id}
              title={document.documentNumber}
              subtitle={`${document.documentType} - ${document.orderNumber}`}
              badges={<StatusBadge value={document.archived ? "ARCHIVE" : "A_ARCHIVER"} />}
              fields={[
                { label: "Client", value: document.clientFullName },
                { label: "Date", value: formatDateShort(document.generatedAt) },
                { label: "Commande", value: document.orderNumber },
                { label: "Montant", value: formatCurrency(document.totalAmount) },
              ]}
              actions={
                <>
                  <button
                    type="button"
                    className="button-secondary px-4"
                    onClick={() => setSelectedDocument(document)}
                  >
                    Consulter
                  </button>
                  <a
                    href={getDownloadUrl(document.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary px-4"
                  >
                    Telecharger
                  </a>
                  {!document.archived ? (
                    <button
                      type="button"
                      className="button-primary px-4"
                      disabled={pendingId === document.id}
                      onClick={() => handleArchive(document.id)}
                    >
                      {pendingId === document.id ? "Archivage..." : "Archiver"}
                    </button>
                  ) : null}
                </>
              }
            />
          )}
        />
        <Pagination
          currentPage={documentPagination.currentPage}
          totalPages={documentPagination.totalPages}
          pageSize={documentPagination.pageSize}
          totalItems={documentPagination.totalItems}
          hrefForPage={documentPagination.hrefForPage}
          hrefForPageSize={documentPagination.hrefForPageSize}
          label="Pagination des documents"
        />
      </div>

      {selectedDocument ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-strong/20 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Fermer"
            onClick={() => setSelectedDocument(null)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-[18px] border border-line bg-white p-6 shadow-[0_18px_40px_rgba(20,37,24,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Detail document</p>
                <h2 className="mt-2 font-heading text-[1.6rem] font-semibold text-brand-strong">
                  {selectedDocument.documentNumber}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Consultez les informations principales et l etat d archivage.
                </p>
              </div>
              <StatusBadge
                value={selectedDocument.archived ? "ARCHIVE" : "A_ARCHIVER"}
              />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Type</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {selectedDocument.documentType}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Reference</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {selectedDocument.documentNumber}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Commande</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {selectedDocument.orderNumber}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Client</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {selectedDocument.clientFullName}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Montant</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {formatCurrency(selectedDocument.totalAmount)}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Date</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {formatDateLong(selectedDocument.generatedAt)}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Archivage</p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {selectedDocument.archived
                    ? `Archive par ${selectedDocument.archivedByFullName ?? "Archiviste"}`
                    : "Document en attente d archivage"}
                </p>
                {selectedDocument.archivedAt ? (
                  <p className="mt-2 text-sm text-muted">
                    Le {formatDateLong(selectedDocument.archivedAt)}
                  </p>
                ) : null}
              </div>
              <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Statut commande
                </p>
                <p className="mt-2 font-semibold text-brand-strong">
                  {formatStatusLabel(selectedDocument.orderStatus)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setSelectedDocument(null)}
              >
                Fermer
              </button>
              <a
                href={getDownloadUrl(selectedDocument.id)}
                target="_blank"
                rel="noreferrer"
                className="button-secondary"
              >
                Telecharger
              </a>
              {!selectedDocument.archived ? (
                <button
                  type="button"
                  className="button-primary"
                  disabled={pendingId === selectedDocument.id}
                  onClick={() => handleArchive(selectedDocument.id)}
                >
                  {pendingId === selectedDocument.id ? "Archivage..." : "Archiver"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
