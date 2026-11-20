import Link from "next/link";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ActionListCard } from "@/components/workspace/action-list-card";
import { DataListCard } from "@/components/workspace/data-list-card";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { CartIcon, PackageIcon, ReceiptIcon, UserIcon } from "@/components/ui/store-icons";
import { getMyCart, getMyInvoices, getMyOrders } from "@/lib/api/customer";
import { getSessionToken } from "@/lib/auth/guards";
import { formatCurrency, formatDateShort } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const token = await getSessionToken();
  let cart: Awaited<ReturnType<typeof getMyCart>> | null = null;
  let orders: Awaited<ReturnType<typeof getMyOrders>> | null = null;
  let invoices: Awaited<ReturnType<typeof getMyInvoices>> | null = null;
  const loadErrors: string[] = [];

  if (token) {
    const [cartResult, ordersResult, invoicesResult] = await Promise.allSettled([
      getMyCart(token),
      getMyOrders(token),
      getMyInvoices(token),
    ]);

    if (cartResult.status === "fulfilled") {
      cart = cartResult.value;
    } else {
      loadErrors.push("le panier");
    }

    if (ordersResult.status === "fulfilled") {
      orders = ordersResult.value;
    } else {
      loadErrors.push("les commandes");
    }

    if (invoicesResult.status === "fulfilled") {
      invoices = invoicesResult.value;
    } else {
      loadErrors.push("les factures");
    }
  }

  const safeOrders = orders ?? [];
  const safeInvoices = invoices ?? [];

  const latestOrder = safeOrders[0] ?? null;

  const metrics = [
    {
      label: "Commandes",
      value: orders ? String(safeOrders.length).padStart(2, "0") : "--",
      detail: "historique disponible dans votre espace",
      icon: "cart" as const,
    },
    {
      label: "Panier",
      value: cart ? String(cart.itemsCount).padStart(2, "0") : "--",
      detail: "articles prets a etre confirmes",
      icon: "products" as const,
    },
    {
      label: "Factures",
      value: invoices ? String(safeInvoices.length).padStart(2, "0") : "--",
      detail: "documents telechargeables",
      icon: "payments" as const,
    },
    {
      label: "Paiements en attente",
      value: orders
        ? String(
            safeOrders.filter((order) => order.paymentStatus === "EN_ATTENTE").length,
          ).padStart(2, "0")
        : "--",
      detail: "commandes a finaliser ou confirmer",
      icon: "chart" as const,
    },
  ];

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Espace client"
        title="Bienvenue dans votre espace SONACOS"
        description="Retrouvez vos commandes, votre panier et vos factures dans un espace simple a consulter."
        breadcrumbs={[
          { label: "Espace client" },
          { label: "Accueil" },
        ]}
        actions={
          <>
            <Link href="/espace-client/panier" className="button-secondary">
              Ouvrir mon panier
            </Link>
            <Link href="/catalogue" className="button-primary">
              Explorer le catalogue
            </Link>
          </>
        }
      />

      {loadErrors.length > 0 ? (
        <DataLoadAlert
          description={`Certaines donnees client n'ont pas pu etre chargees : ${loadErrors.join(", ")}.`}
          retryHref="/espace-client"
        />
      ) : null}

      <MetricGrid items={metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_380px]">
        <DataListCard
          title="Ma derniere commande"
          action={
            <Link href="/espace-client/commandes" className="button-tertiary">
              Voir mes commandes
            </Link>
          }
          items={
            latestOrder
              ? [
                  {
                    title: latestOrder.orderNumber,
                    subtitle: `${formatDateShort(latestOrder.createdAt)} · ${latestOrder.items.length} article(s)`,
                    value: formatCurrency(latestOrder.totalAmount),
                    status: latestOrder.status,
                  },
                ]
              : []
          }
          emptyMessage="Votre premiere commande apparaitra ici apres confirmation."
        />

        <ActionListCard
          title="Acces rapides"
          description="Reprenez vos achats ou consultez vos documents en un clic."
          items={[
            {
              href: "/catalogue",
              label: "Catalogue",
              description: "Parcourir les semences, engrais et produits disponibles.",
              icon: <PackageIcon className="h-4 w-4" />,
            },
            {
              href: "/espace-client/panier",
              label: "Mon panier",
              description: "Verifier les quantites et finaliser une commande.",
              icon: <CartIcon className="h-4 w-4" />,
            },
            {
              href: "/espace-client/factures",
              label: "Mes factures",
              description: "Consulter ou telecharger les factures deja emises.",
              icon: <ReceiptIcon className="h-4 w-4" />,
            },
            {
              href: "/profil",
              label: "Mon profil",
              description: "Mettre a jour mes informations et mon mot de passe.",
              icon: <UserIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataListCard
          title="Dernieres commandes"
          items={safeOrders.slice(0, 5).map((order) => ({
            title: order.orderNumber,
            subtitle: `${formatDateShort(order.createdAt)} · ${order.items.length} article(s)`,
            value: formatCurrency(order.totalAmount),
            status: order.status,
          }))}
          emptyMessage="Vos commandes confirmees apparaitront ici."
        />

        <DataListCard
          title="Factures disponibles"
          items={safeInvoices.slice(0, 5).map((invoice) => ({
            title: invoice.invoiceNumber,
            subtitle: `${invoice.orderNumber} · ${formatDateShort(invoice.generatedAt)}`,
            value: formatCurrency(invoice.totalAmount),
            status: "DISPONIBLE",
          }))}
          emptyMessage="Vos factures seront affichees ici apres validation du paiement."
        />
      </div>
    </>
  );
}
