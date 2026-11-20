import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ResponsableValidationsManagement } from "@/components/responsable/responsable-validations-management";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getSessionToken, requireSession } from "@/lib/auth/guards";
import { getResponsableValidations } from "@/lib/api/validation";

export const dynamic = "force-dynamic";

export default async function SupervisorValidationsPage() {
  const session = await requireSession(["RESPONSABLE"]);
  const token = await getSessionToken();
  let validations: Awaited<ReturnType<typeof getResponsableValidations>> | null = null;

  if (token) {
    try {
      validations = await getResponsableValidations(token);
    } catch {
      validations = null;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Validations"
        title="Demandes a examiner"
        description="Retrouvez les demandes en attente, comprenez leur impact et prenez votre decision sans surcharge technique."
        breadcrumbs={[
          { label: "Responsable" },
          { label: "Demandes" },
        ]}
      />

      {validations ? (
        <ResponsableValidationsManagement
          initialValidations={validations}
          responsableFirstName={session.firstName}
        />
      ) : (
        <DataLoadAlert
          description="La liste des validations n'a pas pu etre chargee."
          retryHref="/responsable/validations"
        />
      )}
    </>
  );
}
