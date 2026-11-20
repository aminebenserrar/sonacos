import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ReceiptIcon, SearchIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAuditeurInvoices } from "@/lib/api/auditeur";
import { getSessionToken } from "@/lib/auth/guards";
import { formatCurrency, formatDateTime, formatStatusLabel } from "@/lib/formatters";
import { parsePaginationPage, parsePaginationSize } from "@/lib/pagination";
import type { ArchiveDocument } from "@/types/archive";

export const dynamic = "force-dynamic";

type AuditeurInvoicesPageProps = {
  searchParams: Promise<{ page?: string; size?: string; search?: string; status?: string }>;
};

function buildAuditeurInvoicesHref(page: number, filters: { search?: string; status?: string; size?: string }) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.size) params.set("size", filters.size);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();

  return query ? `/auditeur/factures?${query}` : "/auditeur/factures";
}

export default async function AuditeurInvoicesPage({
  searchParams,
}: AuditeurInvoicesPageProps) {
  const params = await searchParams;
  const currentPage = parsePaginationPage(params.page);
  const pageSize = parsePaginationSize(params.size);
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const filters = { search, status, size: pageSize === 20 ? undefined : String(pageSize) };
  const token = await getSessionToken();
  let invoices: ArchiveDocument[] = [];
  let loadError = false;

  if (token) {
    try {
      invoices = await getAuditeurInvoices(token);
    } catch {
      loadError = true;
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      invoice.documentNumber.toLowerCase().includes(normalizedSearch) ||
      invoice.orderNumber.toLowerCase().includes(normalizedSearch) ||
      invoice.clientFullName.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      !status ||
      (status === "ARCHIVE" && invoice.archived) ||
      (status === "A_ARCHIVER" && !invoice.archived);

    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(Math.ceil(filteredInvoices.length / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedInvoices = filteredInvoices.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Controle"
        title="Factures"
        description="Consultez les factures liees aux commandes, leur statut documentaire et leur client."
        breadcrumbs={[
          { label: "Auditeur" },
          { label: "Factures" },
        ]}
      />

      <div className="card p-6">
        <form className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_220px_auto]">
          {pageSize !== 20 ? <input type="hidden" name="size" value={pageSize} /> : null}
          <label className="flex h-12 items-center gap-3 rounded-[14px] border border-line bg-white px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <span className="sr-only">Rechercher une facture</span>
            <SearchIcon className="h-4 w-4 text-muted" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Rechercher par numero, commande ou client"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <select name="status" defaultValue={status} className="form-control mt-0 h-12" aria-label="Filtrer par archivage">
            <option value="">Tous les statuts</option>
            <option value="A_ARCHIVER">A archiver</option>
            <option value="ARCHIVE">Archive</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="button-primary h-12">Filtrer</button>
            <a href="/auditeur/factures" className="button-secondary h-12">Reinitialiser</a>
          </div>
          <p className="text-sm text-muted lg:col-span-3" aria-live="polite">
            {filteredInvoices.length} facture{filteredInvoices.length > 1 ? "s" : ""} trouve{filteredInvoices.length > 1 ? "s" : ""}
          </p>
        </form>
        {loadError ? (
          <EmptyState
            icon={<ReceiptIcon className="h-5 w-5" />}
            title="Impossible de charger les factures"
            description="Le serveur n'a pas renvoye les factures visibles par l'auditeur."
          />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="h-5 w-5" />}
            title="Aucune facture disponible"
            description="Les factures accessibles apparaitront ici."
          />
        ) : (
          <div className="table-scroll">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Generation</th>
                  <th>Archivage</th>
                  <th>Statut commande</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-semibold">{invoice.documentNumber}</td>
                    <td>{invoice.orderNumber}</td>
                    <td>{invoice.clientFullName}</td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>{formatDateTime(invoice.generatedAt)}</td>
                    <td>
                      <StatusBadge value={invoice.archived ? "ARCHIVE" : "A_ARCHIVER"} />
                    </td>
                    <td>{formatStatusLabel(invoice.orderStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loadError && invoices.length > 0 ? (
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredInvoices.length}
            hrefForPage={(page) => buildAuditeurInvoicesHref(page, filters)}
            hrefForPageSize={(size) =>
              buildAuditeurInvoicesHref(1, { ...filters, size: size === 20 ? undefined : String(size) })
            }
            label="Pagination des factures auditeur"
          />
        ) : null}
      </div>
    </>
  );
}
