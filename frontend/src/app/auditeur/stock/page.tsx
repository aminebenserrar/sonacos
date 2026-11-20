import { AuditeurStockOverview } from "@/components/auditeur/auditeur-stock-overview";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAuditeurStockMovements } from "@/lib/api/auditeur";
import { getSessionToken } from "@/lib/auth/guards";
import type { StockMovementRecord } from "@/types/manager";

export const dynamic = "force-dynamic";

export default async function AuditeurStockPage() {
  const token = await getSessionToken();
  let movements: StockMovementRecord[] = [];
  let loadError = false;

  if (token) {
    try {
      movements = await getAuditeurStockMovements(token);
    } catch {
      loadError = true;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Contrôle"
        title="Stock"
        description="Consultez l’historique des mouvements de stock et les quantités observées, sans modification."
        breadcrumbs={[
          { label: "Auditeur" },
          { label: "Stock" },
        ]}
      />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<PackageIcon className="h-5 w-5" />}
            title="Impossible de charger le stock"
            description="Le serveur n'a pas renvoyé l'historique des mouvements de stock."
          />
        </div>
      ) : (
        <AuditeurStockOverview initialMovements={movements} />
      )}
    </>
  );
}
