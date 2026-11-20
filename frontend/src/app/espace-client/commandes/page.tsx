import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { ClipboardIcon, SearchIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getMyOrders } from "@/lib/api/customer";
import { getSessionToken } from "@/lib/auth/guards";
import { formatCurrency, formatDateShort, formatStatusLabel } from "@/lib/formatters";
import { parsePaginationPage, parsePaginationSize } from "@/lib/pagination";

export const dynamic = "force-dynamic";

type CustomerOrdersPageProps = {
  searchParams: Promise<{ page?: string; size?: string; search?: string; status?: string }>;
};

function buildCustomerOrdersHref(page: number, filters: { search?: string; status?: string; size?: string }) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.size) params.set("size", filters.size);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();

  return query ? `/espace-client/commandes?${query}` : "/espace-client/commandes";
}

export default async function CustomerOrdersPage({ searchParams }: CustomerOrdersPageProps) {
  const params = await searchParams;
  const currentPage = parsePaginationPage(params.page);
  const pageSize = parsePaginationSize(params.size);
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "";
  const filters = { search, status, size: pageSize === 20 ? undefined : String(pageSize) };
  const token = await getSessionToken();
  let orders: Awaited<ReturnType<typeof getMyOrders>> | null = null;

  if (token) {
    try {
      orders = await getMyOrders(token);
    } catch {
      orders = null;
    }
  }

  if (!orders) {
    return (
      <>
        <WorkspacePageHeader
          title="Mes commandes"
          description="Retrouvez l historique des commandes avec leur statut, leur contenu et leur mode de paiement."
        />
        <DataLoadAlert
          description="Les commandes client n'ont pas pu etre chargees."
          retryHref="/espace-client/commandes"
        />
      </>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      order.orderNumber.toLowerCase().includes(normalizedSearch) ||
      order.deliveryAddress?.toLowerCase().includes(normalizedSearch) ||
      order.comment?.toLowerCase().includes(normalizedSearch) ||
      formatStatusLabel(order.status).toLowerCase().includes(normalizedSearch);
    const matchesStatus = !status || order.status === status;

    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(Math.ceil(filteredOrders.length / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <>
      <WorkspacePageHeader
        title="Mes commandes"
        description="Retrouvez l historique des commandes avec leur statut, leur contenu et leur mode de paiement."
      />

      <div className="grid gap-5">
        <form className="card grid gap-3 p-4 lg:grid-cols-[minmax(0,1.5fr)_220px_auto]">
          {pageSize !== 20 ? <input type="hidden" name="size" value={pageSize} /> : null}
          <label className="flex h-12 items-center gap-3 rounded-[14px] border border-line bg-white px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <span className="sr-only">Rechercher une commande</span>
            <SearchIcon className="h-4 w-4 text-muted" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Rechercher par numero, adresse ou statut"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <select name="status" defaultValue={status} className="form-control mt-0 h-12" aria-label="Filtrer par statut">
            <option value="">Tous les statuts</option>
            {["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "PRETE", "EXPEDIEE", "LIVREE", "ANNULEE", "REFUSEE"].map((item) => (
              <option key={item} value={item}>{formatStatusLabel(item)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="button-primary h-12">Filtrer</button>
            <a href="/espace-client/commandes" className="button-secondary h-12">Reinitialiser</a>
          </div>
          <p className="text-sm text-muted lg:col-span-3" aria-live="polite">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""} trouve{filteredOrders.length > 1 ? "s" : ""}
          </p>
        </form>

        {orders.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon className="h-5 w-5" />}
            title="Aucune commande pour le moment"
            description="Vos commandes apparaitront ici apres votre premier achat."
          />
        ) : null}

        {paginatedOrders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.paymentStatus ?? "EN_ATTENTE"} />
                </div>
                <h2 className="mt-4 font-heading text-2xl font-bold text-brand-strong">
                  {order.orderNumber}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {formatDateShort(order.createdAt)} - {formatStatusLabel(order.receptionMode)} -{" "}
                  {formatStatusLabel(order.paymentMode)}
                </p>
                {order.deliveryAddress ? (
                  <p className="mt-2 text-sm text-muted">{order.deliveryAddress}</p>
                ) : null}
                {order.comment ? (
                  <p className="mt-2 text-sm text-muted">{order.comment}</p>
                ) : null}
              </div>
              <div className="space-y-3 lg:w-[280px]">
                <div className="rounded-[16px] border border-line bg-surface-strong/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Total</p>
                  <p className="mt-2 font-heading text-2xl font-bold text-brand">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                {order.invoiceId && order.invoiceNumber ? (
                  <div className="rounded-[16px] border border-line bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Facture</p>
                    <p className="mt-2 font-semibold text-brand-strong">
                      {order.invoiceNumber}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`/api/customer/invoices/${order.invoiceId}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary px-4"
                      >
                        Telecharger
                      </a>
                      <StatusBadge value="DISPONIBLE" />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <ResponsiveRecords
                items={order.items}
                empty={null}
                desktop={
                  <div className="table-shell">
                    <div className="table-scroll">
                      <table className="table-base">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Reference</th>
                            <th>Quantite</th>
                            <th>Prix unitaire</th>
                            <th>Sous-total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="font-semibold">{item.productName}</td>
                              <td>{item.productReference}</td>
                              <td>{item.quantity}</td>
                              <td className="table-amount">{formatCurrency(item.unitPrice)}</td>
                              <td className="table-amount">{formatCurrency(item.subtotal)}</td>
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
                    title={item.productName}
                    subtitle={item.productReference}
                    fields={[
                      { label: "Quantite", value: item.quantity },
                      { label: "Prix unitaire", value: formatCurrency(item.unitPrice) },
                      { label: "Sous-total", value: formatCurrency(item.subtotal) },
                    ]}
                  />
                )}
              />
            </div>
          </div>
        ))}
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredOrders.length}
          hrefForPage={(page) => buildCustomerOrdersHref(page, filters)}
          hrefForPageSize={(size) =>
            buildCustomerOrdersHref(1, { ...filters, size: size === 20 ? undefined : String(size) })
          }
          label="Pagination des commandes client"
        />
      </div>
    </>
  );
}
