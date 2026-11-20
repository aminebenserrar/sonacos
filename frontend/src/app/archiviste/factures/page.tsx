import { ArchivisteDocumentsManagement } from "@/components/archiviste/archiviste-documents-management";
import { EmptyState } from "@/components/ui/empty-state";
import { ReceiptIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getArchivisteDocuments } from "@/lib/api/archiviste";
import { getSessionToken } from "@/lib/auth/guards";
import type { ArchiveDocument } from "@/types/archive";

export const dynamic = "force-dynamic";

export default async function ArchivisteFacturesPage() {
  const token = await getSessionToken();
  let documents: ArchiveDocument[] = [];
  let loadError = false;

  if (token) {
    try {
      documents = await getArchivisteDocuments(token);
    } catch {
      loadError = true;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Documents"
        title="Factures"
        description="Consultez les factures générées et leur état d’archivage."
        breadcrumbs={[
          { label: "Archiviste" },
          { label: "Factures" },
        ]}
      />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<ReceiptIcon className="h-5 w-5" />}
            title="Impossible de charger les factures"
            description="Le serveur n'a pas renvoyé la liste des factures."
          />
        </div>
      ) : (
        <ArchivisteDocumentsManagement
          initialDocuments={documents}
          initialTab="all"
          scope="factures"
        />
      )}
    </>
  );
}
