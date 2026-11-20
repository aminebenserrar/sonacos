import Link from "next/link";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircleIcon } from "@/components/ui/store-icons";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getResponsableValidations } from "@/lib/api/validation";
import { getSessionToken, requireSession } from "@/lib/auth/guards";
import { formatDateTime } from "@/lib/formatters";
import {
  getDecisionLabel,
  formatValidationType,
  formatValidationRequesterRole,
  getPriorityRank,
  getRelativeTimeLabel,
  getResponsableSummary,
  getValidationImpactLabel,
} from "@/lib/responsable-validations";

export const dynamic = "force-dynamic";

function isSameDay(value: string | null, reference: Date) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export default async function SupervisorDashboardPage() {
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

  if (!validations) {
    return (
      <>
        <WorkspacePageHeader
          eyebrow="Validations"
          title="Tableau de bord"
          description="Comprenez rapidement ce qui attend votre decision et accedez directement aux demandes a examiner."
          breadcrumbs={[
            { label: "Responsable" },
            { label: "Tableau de bord" },
          ]}
          actions={
            <Link href="/responsable/validations" className="button-primary">
              Ouvrir les demandes
            </Link>
          }
        />

        <div className="card p-6">
          <p className="eyebrow">Mon espace</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-brand-strong">
            Bonjour {session.firstName},
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Les demandes ne sont pas disponibles pour le moment. Rechargez la page
            ou revenez plus tard.
          </p>
        </div>

        <DataLoadAlert
          description="Les validations responsable n'ont pas pu etre chargees depuis l'API."
          retryHref="/responsable"
        />
      </>
    );
  }

  const pendingItems = validations
    .filter((item) => item.status === "EN_ATTENTE")
    .sort((left, right) => {
      const priorityGap = getPriorityRank(left.priority) - getPriorityRank(right.priority);
      if (priorityGap !== 0) {
        return priorityGap;
      }

      return new Date(left.requestedAt).getTime() - new Date(right.requestedAt).getTime();
    });

  const today = new Date();
  const urgentPendingCount = pendingItems.filter((item) => item.priority === "HAUTE").length;
  const validatedTodayCount = validations.filter(
    (item) => item.status === "VALIDEE" && isSameDay(item.decidedAt, today),
  ).length;
  const refusedTodayCount = validations.filter(
    (item) => item.status === "REFUSEE" && isSameDay(item.decidedAt, today),
  ).length;

  const metrics = [
    {
      label: "A traiter",
      value: String(pendingItems.length).padStart(2, "0"),
      detail: "demandes en attente de votre decision",
      icon: "check" as const,
    },
    {
      label: "Urgentes",
      value: String(urgentPendingCount).padStart(2, "0"),
      detail: "demandes prioritaires a examiner rapidement",
      icon: "stock" as const,
    },
    {
      label: "Validees aujourd'hui",
      value: String(validatedTodayCount).padStart(2, "0"),
      detail: "decisions favorables enregistrees aujourd'hui",
      icon: "chart" as const,
    },
    {
      label: "Refusees aujourd'hui",
      value: String(refusedTodayCount).padStart(2, "0"),
      detail: "demandes refusees avec motif saisi",
      icon: "stock" as const,
    },
  ];

  const recentDecisions = validations
    .filter((item) => item.status !== "EN_ATTENTE")
    .sort(
      (left, right) =>
        new Date(right.decidedAt ?? right.requestedAt).getTime() -
        new Date(left.decidedAt ?? left.requestedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Validations"
        title="Tableau de bord"
        description="Comprenez rapidement ce qui attend votre decision et accedez directement aux demandes a examiner."
        breadcrumbs={[
          { label: "Responsable" },
          { label: "Tableau de bord" },
        ]}
        actions={
          <Link href="/responsable/validations" className="button-primary">
            Ouvrir les demandes
          </Link>
        }
      />

      <div className="card p-6">
        <p className="eyebrow">Mon espace</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-brand-strong">
          Bonjour {session.firstName},
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          {getResponsableSummary(pendingItems.length, urgentPendingCount)}
        </p>
      </div>

      <MetricGrid items={metrics} />

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">A traiter en priorite</h2>
          <p className="panel-copy">
            Commencez par les demandes en attente qui ont un impact direct sur
            l&apos;activite.
          </p>
        </div>

        {pendingItems.length === 0 ? (
          <div className="mt-5 rounded-[18px] border border-line bg-surface p-6">
            <EmptyState
              icon={<CheckCircleIcon className="h-5 w-5" />}
              title="Tout est a jour"
              description="Vous n'avez aucune demande a traiter pour le moment."
            />
          </div>
        ) : (
          <div className="table-shell mt-5">
            <div className="table-scroll">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Demande</th>
                    <th>Impact</th>
                    <th>Demandeur</th>
                    <th>Priorite</th>
                    <th>Depuis</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td className="min-w-[280px]">
                        <div className="font-semibold text-brand-strong">
                          {formatValidationType(item.operationType)}
                        </div>
                        <div className="mt-1 text-sm text-muted">
                          {item.targetReference}
                        </div>
                      </td>
                      <td className="min-w-[240px] text-sm text-muted">
                        {getValidationImpactLabel(item)}
                      </td>
                      <td>
                        <div className="font-semibold text-brand-strong">
                          {item.requesterFullName}
                        </div>
                        <div className="mt-1 text-sm text-muted">
                          {formatValidationRequesterRole(item.requesterRole)}
                        </div>
                      </td>
                      <td>
                        <StatusBadge value={item.priority} kind="priority" />
                      </td>
                      <td>{getRelativeTimeLabel(item.requestedAt)}</td>
                      <td>
                        <Link
                          href={`/responsable/validations/${item.id}?returnTo=/responsable`}
                          className="button-secondary"
                        >
                          Examiner
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Dernieres decisions</h2>
          <p className="panel-copy">
            Les validations et refus recents restent faciles a relire.
          </p>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="mt-5 rounded-[18px] border border-line bg-surface p-6">
            <EmptyState
              icon={<CheckCircleIcon className="h-5 w-5" />}
              title="Aucune decision recente"
              description="Les demandes traitees apparaitront ici."
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {recentDecisions.map((item) => (
              <article
                key={item.id}
                className="rounded-[18px] border border-line bg-white p-5 shadow-[0_10px_28px_rgba(24,57,38,0.05)]"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-strong">
                      {formatValidationType(item.operationType)}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{item.targetReference}</p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={`/responsable/validations/${item.id}?returnTo=/responsable`}
                    className="button-secondary"
                  >
                    Examiner
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-3">
                  <p>
                    <span className="font-semibold text-brand-strong">Demandeur :</span>{" "}
                    {item.requesterFullName}
                  </p>
                  <p>
                    <span className="font-semibold text-brand-strong">Decision :</span>{" "}
                    {getDecisionLabel(item)}
                  </p>
                  <p>
                    <span className="font-semibold text-brand-strong">Le :</span>{" "}
                    {formatDateTime(item.decidedAt ?? item.requestedAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
