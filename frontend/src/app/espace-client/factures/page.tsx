import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { ReceiptIcon, SearchIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getMyInvoices } from "@/lib/api/customer";
import { getSessionToken } from "@/lib/auth/guards";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { parsePaginationPage, parsePaginationSize } from "@/lib/pagination";

export const dynamic = "force-dynamic";

type CustomerInvoicesPageProps = {
  searchParams: Promise<{ page?: string; size?: string; search?: string }>;
};

function buildCustomerInvoicesHref(page: number, filters: { search?: string; size?: string }) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.size) params.set("size", filters.size);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();

  return query ? `/espace-client/factures?${query}` : "/espace-client/factures";
}

export default async function CustomerInvoicesPage({
  searchParams,
}: CustomerInvoicesPageProps) {
  const params = await searchParams;
  const currentPage = parsePaginationPage(params.page);
  const pageSize = parsePaginationSize(params.size);
  const search = params.search?.trim() ?? "";
  const filters = { search, size: pageSize === 20 ? undefined : String(pageSize) };
  const token = await getSessionToken();
  let invoices: Awaited<ReturnType<typeof getMyInvoices>> | null = null;

  if (token) {
    try {
      invoices = await getMyInvoices(token);
    } catch {
      invoices = null;
    }
  }

  if (!invoices) {
    return (
      <>
        <WorkspacePageHeader
          title="Mes factures"
          description="Consultez les factures liees a vos commandes et a vos paiements."
        />
        <DataLoadAlert
          description="Les factures client n'ont pas pu etre chargees."
          retryHref="/espace-client/factures"
        />
      </>
    );
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const normalizedSearch = search.toLowerCase();

    return (
      normalizedSearch.length === 0 ||
      invoice.invoiceNumber.toLowerCase().includes(normalizedSearch) ||
      invoice.orderNumber.toLowerCase().includes(normalizedSearch)
    );
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
        title="Mes factures"
        description="Consultez les factures liees a vos commandes et a vos paiements."
      />

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Factures disponibles</h2>
          <p className="panel-copy">
            Retrouvez le numero, la commande associee et le montant total de chaque facture.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[16px] border border-line bg-surface-strong/60 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Synthese
            </p>
            <p className="mt-1 text-sm text-muted">
              {invoices.length} facture{invoices.length > 1 ? "s" : ""} disponible
              {invoices.length > 1 ? "s" : ""} au telechargement.
            </p>
          </div>
          {invoices.length > 0 ? <StatusBadge value="DISPONIBLE" /> : null}
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_auto]">
          {pageSize !== 20 ? <input type="hidden" name="size" value={pageSize} /> : null}
          <label className="flex h-12 items-center gap-3 rounded-[14px] border border-line bg-white px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <span className="sr-only">Rechercher une facture</span>
            <SearchIcon className="h-4 w-4 text-muted" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Rechercher par numero ou commande"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="button-primary h-12">Filtrer</button>
            <a href="/espace-client/factures" className="button-secondary h-12">Reinitialiser</a>
          </div>
          <p className="text-sm text-muted lg:col-span-2" aria-live="polite">
            {filteredInvoices.length} facture{filteredInvoices.length > 1 ? "s" : ""} trouve{filteredInvoices.length > 1 ? "s" : ""}
          </p>
        </form>

        <div className="mt-5">
          <ResponsiveRecords
            items={paginatedInvoices}
            empty={
              <div className="rounded-[18px] border border-line bg-surface p-6">
                <EmptyState
                  icon={<ReceiptIcon className="h-5 w-5" />}
                  title="Aucune facture disponible"
                  description="Vos factures apparaitront ici apres validation de vos commandes."
                />
              </div>
            }
            desktop={
              <div className="table-shell">
                <div className="table-scroll">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Facture</th>
                        <th>Commande</th>
                        <th>Date</th>
                        <th>Montant HT</th>
                        <th>TVA</th>
                        <th>Total</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="font-semibold">{invoice.invoiceNumber}</td>
                          <td>{invoice.orderNumber}</td>
                          <td>{formatDateShort(invoice.generatedAt)}</td>
                          <td className="table-amount">
                            {formatCurrency(invoice.amountExcludingTax)}
                          </td>
                          <td className="table-amount">
                            {formatCurrency(invoice.taxAmount)}
                          </td>
                          <td className="table-amount">
                            {formatCurrency(invoice.totalAmount)}
                          </td>
                          <td>
                            <StatusBadge value="DISPONIBLE" />
                          </td>
                          <td>
                            <a
                              href={`/api/customer/invoices/${invoice.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="button-secondary px-4"
                            >
                              Telecharger
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
            renderMobileCard={(invoice) => (
              <MobileDataCard
                key={invoice.id}
                title={invoice.invoiceNumber}
                subtitle={`Commande ${invoice.orderNumber}`}
                badges={<StatusBadge value="DISPONIBLE" />}
                fields={[
                  { label: "Date", value: formatDateShort(invoice.generatedAt) },
                  {
                    label: "Montant HT",
                    value: formatCurrency(invoice.amountExcludingTax),
                  },
                  { label: "TVA", value: formatCurrency(invoice.taxAmount) },
                  { label: "Total", value: formatCurrency(invoice.totalAmount) },
                ]}
                actions={
                  <a
                    href={`/api/customer/invoices/${invoice.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary px-4"
                  >
                    Telecharger
                  </a>
                }
              />
            )}
          />
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredInvoices.length}
            hrefForPage={(page) => buildCustomerInvoicesHref(page, filters)}
            hrefForPageSize={(size) =>
              buildCustomerInvoicesHref(1, { ...filters, size: size === 20 ? undefined : String(size) })
            }
            label="Pagination des factures client"
          />
        </div>
      </div>
    </>
  );
}
