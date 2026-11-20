import { AuditeurValidationsOverview } from "@/components/auditeur/auditeur-validations-overview";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircleIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAuditeurValidations } from "@/lib/api/auditeur";
import { getSessionToken } from "@/lib/auth/guards";
import type { ValidationOperation } from "@/types/validation";

export const dynamic = "force-dynamic";

export default async function AuditeurValidationsPage() {
  const token = await getSessionToken();
  let validations: ValidationOperation[] = [];
  let loadError = false;

  if (token) {
    try {
      validations = await getAuditeurValidations(token);
    } catch {
      loadError = true;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Contrôle"
        title="Validations"
        description="Consultez les validations traitées par le responsable et leur priorité, sans action métier."
        breadcrumbs={[
          { label: "Auditeur" },
          { label: "Validations" },
        ]}
      />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<CheckCircleIcon className="h-5 w-5" />}
            title="Impossible de charger les validations"
            description="Le serveur n'a pas renvoyé les validations visibles par l'auditeur."
          />
        </div>
      ) : (
        <AuditeurValidationsOverview initialValidations={validations} />
      )}
    </>
  );
}
