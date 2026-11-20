import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CheckCircleIcon,
  ClipboardIcon,
  PackageIcon,
  SettingsIcon,
} from "@/components/ui/store-icons";
import { ActionListCard } from "@/components/workspace/action-list-card";
import { DataListCard } from "@/components/workspace/data-list-card";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAuditeurDashboard } from "@/lib/api/auditeur";
import { getSessionToken } from "@/lib/auth/guards";
import { formatDateTime, formatStatusLabel } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AuditeurDashboardPage() {
  const token = await getSessionToken();
  let dashboard = null;
  let loadError = false;

  if (token) {
    try {
      dashboard = await getAuditeurDashboard(token);
    } catch {
      loadError = true;
    }
  }

  const metrics = [
    {
      label: "Opérations aujourd'hui",
      value: String(dashboard?.operationsToday ?? 0).padStart(2, "0"),
      detail: "actions enregistrées dans le journal d'audit",
      icon: "chart" as const,
    },
    {
      label: "Opérations sensibles",
      value: String(dashboard?.sensitiveOperationsToday ?? 0).padStart(2, "0"),
      detail: "éléments à surveiller en priorité",
      icon: "check" as const,
    },
    {
      label: "Anomalies ou refus",
      value: String(dashboard?.anomaliesToday ?? 0).padStart(2, "0"),
      detail: "événements de contrôle détectés aujourd'hui",
      icon: "stock" as const,
    },
    {
      label: "Utilisateurs actifs",
      value: String(dashboard?.activeUsersToday ?? 0).padStart(2, "0"),
      detail: "utilisateurs ayant effectué une action aujourd'hui",
      icon: "users" as const,
    },
  ];

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Espace auditeur"
        title="Tableau de bord"
        description="Contrôlez la traçabilité du système et consultez les modules métier en lecture seule."
        breadcrumbs={[
          { label: "Auditeur" },
          { label: "Tableau de bord" },
        ]}
        actions={
          <Link href="/auditeur/journal" className="button-primary">
            Ouvrir le journal
          </Link>
        }
      />

      <MetricGrid items={metrics} />

      {loadError ? (
        <div className="card p-6">
          <EmptyState
            icon={<ClipboardIcon className="h-5 w-5" />}
            title="Impossible de charger le tableau de bord"
            description="Le serveur n'a pas renvoyé les données d'audit. Réessayez dans quelques instants."
            action={
              <Link href="/auditeur" className="button-primary">
                Réessayer
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
            <DataListCard
              title="Activité récente"
              action={
                <Link href="/auditeur/journal" className="button-tertiary">
                  Voir tout
                </Link>
              }
              items={(dashboard?.recentOperations ?? []).map((entry) => ({
                title: `${formatStatusLabel(entry.level)} · ${entry.objectIdentifier}`,
                subtitle: `${entry.performedByFullName} · ${formatDateTime(entry.createdAt)}`,
                status: entry.level,
              }))}
              emptyMessage="Aucune opération d'audit n'a encore été enregistrée."
            />

            <ActionListCard
              title="Accès rapides"
              description="Consultez les zones de contrôle autorisées pour l'auditeur."
              items={[
                {
                  href: "/auditeur/journal",
                  label: "Journal des opérations",
                  description: "Filtrer les actions par module, rôle, date et niveau.",
                  icon: <ClipboardIcon className="h-4 w-4" />,
                },
                {
                  href: "/auditeur/commandes",
                  label: "Commandes",
                  description: "Visualiser les commandes sans action de modification.",
                  icon: <ClipboardIcon className="h-4 w-4" />,
                },
                {
                  href: "/auditeur/paiements",
                  label: "Paiements",
                  description: "Verifier les paiements associes aux commandes clients.",
                  icon: <ClipboardIcon className="h-4 w-4" />,
                },
                {
                  href: "/auditeur/factures",
                  label: "Factures",
                  description: "Consulter les factures et leur statut documentaire.",
                  icon: <ClipboardIcon className="h-4 w-4" />,
                },
                {
                  href: "/auditeur/stock",
                  label: "Stock",
                  description: "Consulter les mouvements et l'historique des quantités.",
                  icon: <PackageIcon className="h-4 w-4" />,
                },
                {
                  href: "/auditeur/validations",
                  label: "Validations",
                  description: "Voir les décisions prises sur les opérations sensibles.",
                  icon: <CheckCircleIcon className="h-4 w-4" />,
                },
                {
                  href: "/profil",
                  label: "Mon profil",
                  description: "Consulter vos informations personnelles et votre rôle.",
                  icon: <SettingsIcon className="h-4 w-4" />,
                },
              ]}
            />
          </div>

          <div className="card p-6">
            <div>
              <p className="eyebrow">Répartition</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-strong">
                Répartition des opérations
              </h2>
            </div>

            {dashboard && dashboard.moduleBreakdown.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {dashboard.moduleBreakdown.map((item) => (
                  <div key={item.module} className="subtle-panel p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {item.module}
                    </p>
                    <p className="mt-3 font-heading text-[1.8rem] font-semibold text-brand-strong">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon={<ClipboardIcon className="h-5 w-5" />}
                  title="Aucune répartition disponible"
                  description="Les modules apparaîtront ici dès que des opérations d'audit seront enregistrées."
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
