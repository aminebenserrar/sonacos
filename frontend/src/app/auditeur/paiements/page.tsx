import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { CreditCardIcon, SearchIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAuditeurPayments } from "@/lib/api/auditeur";
import { getSessionToken } from "@/lib/auth/guards";
import { formatCurrency, formatDateTime, formatStatusLabel } from "@/lib/formatters";
import { parsePaginationPage, parsePaginationSize } from "@/lib/pagination";
import type { PaymentRecord } from "@/types/manager";

export const dynamic = "force-dynamic";

type AuditeurPaymentsPageProps = {
  searchParams: Promise<{ page?: string; size?: string; search?: string; status?: string }>;
};

function buildAuditeurPaymentsHref(page: number, filters: { search?: string; status?: string; size?: string }) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.size) params.set("size", filters.size);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();

  return query ? `/auditeur/paiements?${query}` : "/auditeur/paiements";
}

export default async function AuditeurPaymentsPage({
  searchParams,
}: AuditeurPaymentsPageProps) {
  const params = await searchParams;
  const currentPage = parsePaginationPage(params.page);
  const pageSize = parsePaginationSize(params.size);
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const filters = { search, status, size: pageSize === 20 ? undefined : String(pageSize) };
  const token = await getSessionToken();
  let payments: PaymentRecord[] = [];
  let loadError = false;

  if (token) {
    try {
      payments = await getAuditeurPayments(token);
    } catch {
      loadError = true;
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      payment.paymentReference.toLowerCase().includes(normalizedSearch) ||
      payment.orderNumber.toLowerCase().includes(normalizedSearch) ||
      payment.clientFullName.toLowerCase().includes(normalizedSearch);
    const matchesStatus = !status || payment.status === status;

    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(Math.ceil(filteredPayments.length / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPayments = filteredPayments.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Controle"
        title="Paiements"
        description="Consultez les paiements associes aux commandes clients, sans possibilite de modification."
        breadcrumbs={[
          { label: "Auditeur" },
          { label: "Paiements" },
        ]}
      />

      <div className="card p-6">
        <form className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_220px_auto]">
          {pageSize !== 20 ? <input type="hidden" name="size" value={pageSize} /> : null}
          <label className="flex h-12 items-center gap-3 rounded-[14px] border border-line bg-white px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <span className="sr-only">Rechercher un paiement</span>
            <SearchIcon className="h-4 w-4 text-muted" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Rechercher par reference, commande ou client"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <select name="status" defaultValue={status} className="form-control mt-0 h-12" aria-label="Filtrer par statut">
            <option value="">Tous les statuts</option>
            {["EN_ATTENTE", "VALIDE", "REFUSE", "REMBOURSE"].map((item) => (
              <option key={item} value={item}>{formatStatusLabel(item)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="button-primary h-12">Filtrer</button>
            <a href="/auditeur/paiements" className="button-secondary h-12">Reinitialiser</a>
          </div>
          <p className="text-sm text-muted lg:col-span-3" aria-live="polite">
            {filteredPayments.length} paiement{filteredPayments.length > 1 ? "s" : ""} trouve{filteredPayments.length > 1 ? "s" : ""}
          </p>
        </form>
        {loadError ? (
          <EmptyState
            icon={<CreditCardIcon className="h-5 w-5" />}
            title="Impossible de charger les paiements"
            description="Le serveur n'a pas renvoye les paiements visibles par l'auditeur."
          />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<CreditCardIcon className="h-5 w-5" />}
            title="Aucun paiement disponible"
            description="Les paiements accessibles apparaitront ici."
          />
        ) : (
          <div className="table-scroll">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Mode</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-semibold">{payment.paymentReference}</td>
                    <td>{payment.orderNumber}</td>
                    <td>{payment.clientFullName}</td>
                    <td>{formatStatusLabel(payment.paymentMode)}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>
                      <StatusBadge value={payment.status} />
                    </td>
                    <td>
                      {payment.paymentDate ? formatDateTime(payment.paymentDate) : "Non renseignee"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loadError && payments.length > 0 ? (
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredPayments.length}
            hrefForPage={(page) => buildAuditeurPaymentsHref(page, filters)}
            hrefForPageSize={(size) =>
              buildAuditeurPaymentsHref(1, { ...filters, size: size === 20 ? undefined : String(size) })
            }
            label="Pagination des paiements auditeur"
          />
        ) : null}
      </div>
    </>
  );
}
