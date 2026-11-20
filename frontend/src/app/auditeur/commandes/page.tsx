import { AuditeurOrdersOverview } from "@/components/auditeur/auditeur-orders-overview";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAuditeurOrders } from "@/lib/api/auditeur";
import { getSessionToken } from "@/lib/auth/guards";
import type { ManagerOrder } from "@/types/manager";

export const dynamic = "force-dynamic";

export default async function AuditeurOrdersPage() {
  const token = await getSessionToken();
  let orders: ManagerOrder[] = [];
  let loadError = false;

  if (token) {
    try {
      orders = await getAuditeurOrders(token);
    } catch {
      loadError = true;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Contrôle"
        title="Commandes"
        description="Consultez les commandes clients depuis l’espace auditeur, sans possibilité de modification."
        breadcrumbs={[
          { label: "Auditeur" },
          { label: "Commandes" },
        ]}
      />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<ClipboardIcon className="h-5 w-5" />}
            title="Impossible de charger les commandes"
            description="Le serveur n'a pas renvoyé les commandes visibles par l'auditeur."
          />
        </div>
      ) : (
        <AuditeurOrdersOverview initialOrders={orders} />
      )}
    </>
  );
}
