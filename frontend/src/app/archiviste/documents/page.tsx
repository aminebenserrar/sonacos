import { ArchivisteDocumentsManagement } from "@/components/archiviste/archiviste-documents-management";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getArchivisteDocuments } from "@/lib/api/archiviste";
import { getSessionToken } from "@/lib/auth/guards";
import type { ArchiveDocument } from "@/types/archive";

export const dynamic = "force-dynamic";

type ArchivisteDocumentsPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function ArchivisteDocumentsPage({
  searchParams,
}: ArchivisteDocumentsPageProps) {
  const params = await searchParams;
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

  const initialTab =
    params.tab === "archived" || params.tab === "pending" ? params.tab : "all";

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Documents"
        title="Documents"
        description="Centralisez les factures et les documents disponibles pour l'archivage."
        breadcrumbs={[
          { label: "Archiviste" },
          { label: "Documents" },
        ]}
      />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<ClipboardIcon className="h-5 w-5" />}
            title="Impossible de charger les documents"
            description="Le serveur n'a pas renvoyé les documents d'archivage."
          />
        </div>
      ) : (
        <ArchivisteDocumentsManagement
          initialDocuments={documents}
          initialTab={initialTab}
        />
      )}
    </>
  );
}
