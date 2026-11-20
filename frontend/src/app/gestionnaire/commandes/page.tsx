import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ManagerOrdersManagement } from "@/components/manager/manager-orders-management";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getManagerOrders } from "@/lib/api/manager";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ManagerOrdersPage() {
  const token = await getSessionToken();
  let orders: Awaited<ReturnType<typeof getManagerOrders>> | null = null;

  if (token) {
    try {
      orders = await getManagerOrders(token);
    } catch {
      orders = null;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Traitement des commandes"
        description="Consultez les commandes a preparer, a valider ou a remettre au client."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Commandes" },
        ]}
      />

      {orders ? (
        <ManagerOrdersManagement initialOrders={orders} />
      ) : (
        <DataLoadAlert
          description="Les commandes gestionnaire n'ont pas pu etre chargees."
          retryHref="/gestionnaire/commandes"
        />
      )}
    </>
  );
}
