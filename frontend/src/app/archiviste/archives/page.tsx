import { ArchivisteDocumentsManagement } from "@/components/archiviste/archiviste-documents-management";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getArchivisteDocuments } from "@/lib/api/archiviste";
import { getSessionToken } from "@/lib/auth/guards";
import type { ArchiveDocument } from "@/types/archive";

export const dynamic = "force-dynamic";

export default async function ArchivisteArchivesPage() {
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
        title="Archives"
        description="Retrouvez les documents déjà archivés et leur historique de classement."
        breadcrumbs={[
          { label: "Archiviste" },
          { label: "Archives" },
        ]}
      />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<ShieldIcon className="h-5 w-5" />}
            title="Impossible de charger les archives"
            description="Le serveur n'a pas renvoyé les documents archivés."
          />
        </div>
      ) : (
        <ArchivisteDocumentsManagement
          initialDocuments={documents}
          initialTab="archived"
          scope="archives"
        />
      )}
    </>
  );
}
