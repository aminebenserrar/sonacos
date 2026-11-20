import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon, SettingsIcon } from "@/components/ui/store-icons";
import { ActionListCard } from "@/components/workspace/action-list-card";
import { DataListCard } from "@/components/workspace/data-list-card";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getArchivisteDocuments } from "@/lib/api/archiviste";
import { getSessionToken } from "@/lib/auth/guards";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import type { ArchiveDocument } from "@/types/archive";

export const dynamic = "force-dynamic";

export default async function ArchivisteDashboardPage() {
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

  const metrics = [
    {
      label: "Documents disponibles",
      value: String(documents.length).padStart(2, "0"),
      detail: "documents métier centralisés",
      icon: "products" as const,
    },
    {
      label: "Documents archivés",
      value: String(documents.filter((item) => item.archived).length).padStart(2, "0"),
      detail: "documents déjà classés",
      icon: "check" as const,
    },
    {
      label: "À archiver",
      value: String(documents.filter((item) => !item.archived).length).padStart(2, "0"),
      detail: "documents encore en attente",
      icon: "stock" as const,
    },
    {
      label: "Factures récentes",
      value: String(documents.filter((item) => item.documentType === "FACTURE").length).padStart(2, "0"),
      detail: "factures visibles dans l'espace documentaire",
      icon: "chart" as const,
    },
  ];

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Espace archiviste"
        title="Tableau de bord"
        description="Centralisez, recherchez et archivez les documents métier depuis un espace documentaire simple et crédible."
        breadcrumbs={[
          { label: "Archiviste" },
          { label: "Tableau de bord" },
        ]}
        actions={
          <Link href="/archiviste/documents" className="button-primary">
            Consulter les documents
          </Link>
        }
      />

      <MetricGrid items={metrics} />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<ClipboardIcon className="h-5 w-5" />}
            title="Impossible de charger les documents"
            description="Les données documentaires ne sont pas disponibles pour le moment."
            action={
              <Link href="/archiviste" className="button-primary">
                Réessayer
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_380px]">
          <DataListCard
            title="Documents récents"
            action={
              <Link href="/archiviste/documents" className="button-tertiary">
                Voir tout
              </Link>
            }
            items={documents.slice(0, 6).map((document) => ({
              title: document.documentNumber,
              subtitle: `${document.clientFullName} · ${formatDateShort(document.generatedAt)}`,
              value: formatCurrency(document.totalAmount),
              status: document.archived ? "ARCHIVE" : "A_ARCHIVER",
            }))}
            emptyMessage="Les nouveaux documents apparaîtront ici."
          />

          <ActionListCard
            title="Accès rapides"
            description="Accédez directement aux écrans utiles de consultation et de classement."
            items={[
              {
                href: "/archiviste/documents",
                label: "Gérer les documents",
                description: "Consulter, filtrer et archiver les documents disponibles.",
                icon: <ClipboardIcon className="h-4 w-4" />,
              },
              {
                href: "/profil",
                label: "Mon profil",
                description: "Consulter vos informations de compte archiviste.",
                icon: <SettingsIcon className="h-4 w-4" />,
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
