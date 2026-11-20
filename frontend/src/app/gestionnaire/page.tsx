import Link from "next/link";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ActionListCard } from "@/components/workspace/action-list-card";
import { DataListCard } from "@/components/workspace/data-list-card";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import {
  CartIcon,
  ClipboardIcon,
  CreditCardIcon,
  PackageIcon,
} from "@/components/ui/store-icons";
import {
  getManagerOrders,
  getManagerPayments,
  getManagerStockMovements,
} from "@/lib/api/manager";
import { getSessionToken } from "@/lib/auth/guards";
import {
  formatCurrency,
  formatDateShort,
  formatStatusLabel,
} from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const token = await getSessionToken();
  let orders: Awaited<ReturnType<typeof getManagerOrders>> | null = null;
  let payments: Awaited<ReturnType<typeof getManagerPayments>> | null = null;
  let stockMovements: Awaited<ReturnType<typeof getManagerStockMovements>> | null =
    null;
  const loadErrors: string[] = [];

  if (token) {
    const [ordersResult, paymentsResult, stockResult] = await Promise.allSettled([
      getManagerOrders(token),
      getManagerPayments(token),
      getManagerStockMovements(token),
    ]);

    if (ordersResult.status === "fulfilled") {
      orders = ordersResult.value;
    } else {
      loadErrors.push("les commandes");
    }

    if (paymentsResult.status === "fulfilled") {
      payments = paymentsResult.value;
    } else {
      loadErrors.push("les paiements");
    }

    if (stockResult.status === "fulfilled") {
      stockMovements = stockResult.value;
    } else {
      loadErrors.push("le stock");
    }
  }

  const safeOrders = orders ?? [];
  const safePayments = payments ?? [];
  const safeStockMovements = stockMovements ?? [];

  const revenue = safePayments
    .filter((payment) => payment.status === "VALIDE")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = safePayments.filter(
    (payment) => payment.status === "EN_ATTENTE",
  ).length;

  const lowStockReferences = new Set(
    safeStockMovements
      .filter((movement) => movement.stockAfter <= 10)
      .map((movement) => movement.productReference),
  );

  const metrics = [
    {
      label: "Commandes",
      value: orders ? String(safeOrders.length).padStart(2, "0") : "--",
      detail: "commandes a suivre dans l espace gestion",
      icon: "cart" as const,
    },
    {
      label: "Paiements valides",
      value: payments ? formatCurrency(revenue) : "--",
      detail: "montant total confirme a ce jour",
      icon: "payments" as const,
    },
    {
      label: "Stock faible",
      value: stockMovements ? String(lowStockReferences.size).padStart(2, "0") : "--",
      detail: "references en dessous du seuil d alerte",
      icon: "stock" as const,
    },
    {
      label: "Paiements en attente",
      value: payments ? String(pendingPayments).padStart(2, "0") : "--",
      detail: "dossiers a controler rapidement",
      icon: "chart" as const,
    },
  ];

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion commerciale"
        title="Tableau de bord"
        description="Suivez les commandes, le stock et les paiements depuis une vue de pilotage claire et sans surcharge."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Tableau de bord" },
        ]}
        actions={
          <>
            <Link href="/gestionnaire/stock" className="button-secondary">
              Voir le stock
            </Link>
            <Link href="/gestionnaire/produits" className="button-primary">
              Gerer les produits
            </Link>
          </>
        }
      />

      {loadErrors.length > 0 ? (
        <DataLoadAlert
          description={`Certaines donnees de gestion n'ont pas pu etre chargees : ${loadErrors.join(", ")}.`}
          retryHref="/gestionnaire"
        />
      ) : null}

      <MetricGrid items={metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <DataListCard
          title="Commandes recentes"
          action={
            <Link href="/gestionnaire/commandes" className="button-tertiary">
              Voir toutes
            </Link>
          }
          items={safeOrders.slice(0, 6).map((order) => ({
            title: `${order.orderNumber} · ${order.clientFullName}`,
            subtitle: `${formatDateShort(order.createdAt)} · Paiement ${formatStatusLabel(order.paymentStatus ?? "EN_ATTENTE")}`,
            value: formatCurrency(order.totalAmount),
            status: order.status,
          }))}
          emptyMessage="Les nouvelles commandes apparaitront ici."
        />

        <ActionListCard
          title="Acces rapides"
          description="Passez directement aux ecrans les plus utiles pour le traitement quotidien."
          items={[
            {
              href: "/gestionnaire/produits",
              label: "Produits",
              description: "Ajouter, modifier ou activer une reference du catalogue.",
              icon: <PackageIcon className="h-4 w-4" />,
            },
            {
              href: "/gestionnaire/stock",
              label: "Stock",
              description: "Enregistrer un mouvement et surveiller les seuils d alerte.",
              icon: <ClipboardIcon className="h-4 w-4" />,
            },
            {
              href: "/gestionnaire/commandes",
              label: "Commandes",
              description: "Suivre les commandes a preparer ou a remettre au client.",
              icon: <CartIcon className="h-4 w-4" />,
            },
            {
              href: "/gestionnaire/paiements",
              label: "Paiements",
              description: "Verifier les reglements et les factures associees.",
              icon: <CreditCardIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataListCard
          title="Alertes stock"
          action={
            <Link href="/gestionnaire/stock" className="button-tertiary">
              Ouvrir le stock
            </Link>
          }
          items={safeStockMovements
            .filter((movement) => movement.stockAfter <= 10)
            .slice(0, 6)
            .map((movement) => ({
              title: movement.productName,
              subtitle: `${movement.productReference} · Stock restant ${movement.stockAfter}`,
              status: movement.movementType,
            }))}
          emptyMessage="Aucun produit n est actuellement sous le seuil d alerte."
        />

        <DataListCard
          title="Paiements recents"
          action={
            <Link href="/gestionnaire/paiements" className="button-tertiary">
              Voir les paiements
            </Link>
          }
          items={safePayments.slice(0, 6).map((payment) => ({
            title: `${payment.paymentReference} · ${payment.clientFullName}`,
            subtitle: `${payment.orderNumber} · ${formatStatusLabel(payment.paymentMode)}`,
            value: formatCurrency(payment.amount),
            status: payment.status,
          }))}
          emptyMessage="Les paiements valides ou en attente apparaitront ici."
        />
      </div>
    </>
  );
}
