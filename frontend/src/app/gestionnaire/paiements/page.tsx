import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ManagerPaymentsManagement } from "@/components/manager/manager-payments-management";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getManagerPayments } from "@/lib/api/manager";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ManagerPaymentsPage() {
  const token = await getSessionToken();
  let payments: Awaited<ReturnType<typeof getManagerPayments>> | null = null;

  if (token) {
    try {
      payments = await getManagerPayments(token);
    } catch {
      payments = null;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Paiements et factures"
        description="Confirmez les paiements recents et suivez la preparation des factures."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Paiements" },
        ]}
      />

      {payments ? (
        <ManagerPaymentsManagement initialPayments={payments} />
      ) : (
        <DataLoadAlert
          description="Les paiements gestionnaire n'ont pas pu etre charges."
          retryHref="/gestionnaire/paiements"
        />
      )}
    </>
  );
}
