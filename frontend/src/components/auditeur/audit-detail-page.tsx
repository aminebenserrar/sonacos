import Link from "next/link";
import { DetailField, DetailPageHeader, DetailSection } from "@/components/ui/detail-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  formatAuditAction,
  formatAuditModule,
  getAuditChangeLabels,
  getAuditReferenceLabel,
  hasAuditChange,
} from "@/lib/audit";
import { formatDateTime } from "@/lib/formatters";
import type { AuditLogEntry } from "@/types/audit";

type AuditDetailPageProps = {
  entry: AuditLogEntry;
  backHref: string;
  backLabel: string;
  sectionLabel: string;
};

function getContextFields(entry: AuditLogEntry) {
  const fields = [
    {
      label: getAuditReferenceLabel(entry),
      value: entry.objectIdentifier,
    },
  ];

  if (entry.objectType === "USER" && entry.performedByFullName) {
    fields.push({
      label: "Operateur",
      value: entry.performedByFullName,
    });
  }

  return fields;
}

export function AuditDetailPage({
  entry,
  backHref,
  backLabel,
  sectionLabel,
}: AuditDetailPageProps) {
  const changeLabels = getAuditChangeLabels(entry);
  const contextFields = getContextFields(entry);

  return (
    <div className="grid gap-6">
      <DetailPageHeader
        backHref={backHref}
        backLabel={backLabel}
        eyebrow={sectionLabel}
        title="Detail de l operation"
        subtitle={entry.objectIdentifier}
        badges={
          <>
            <StatusBadge value={entry.level} />
            <StatusBadge value={entry.performedByRole} kind="role" />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <DetailSection
          title="Informations de l operation"
          description="Vue complete de l action enregistree dans le journal."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="Date et heure" value={formatDateTime(entry.createdAt)} />
            <DetailField label="Module" value={formatAuditModule(entry.objectType)} />
            <DetailField label="Action" value={formatAuditAction(entry.actionType)} />
            <DetailField label="Reference" value={entry.objectIdentifier} />
          </div>

          {entry.description ? (
            <div className="mt-4 rounded-[16px] border border-line bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-brand-strong">
                {entry.description}
              </p>
            </div>
          ) : null}
        </DetailSection>

        <DetailSection
          title="Utilisateur"
          description="Identite du compte ayant effectue l operation."
        >
          <div className="flex items-start gap-4 rounded-[16px] border border-line bg-surface p-4">
            <UserAvatar name={entry.performedByFullName} size="lg" />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-brand-strong">{entry.performedByFullName}</p>
              <p className="mt-1 text-sm text-muted">
                {entry.performedByEmail || "Adresse e-mail non disponible"}
              </p>
              <div className="mt-3">
                <StatusBadge value={entry.performedByRole} kind="role" />
              </div>
            </div>
          </div>
        </DetailSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DetailSection
          title="Contexte"
          description="Informations directement rattachees a la ressource concernee."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {contextFields.map((field) => (
              <DetailField key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </DetailSection>

        {hasAuditChange(entry) ? (
          <DetailSection
            title="Modification"
            description="Comparaison des valeurs avant et apres l operation."
          >
            <div className="grid gap-4">
              {entry.oldValue?.trim() ? (
                <div className="rounded-[16px] border border-line bg-surface p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {changeLabels.oldLabel}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-brand-strong">
                    {entry.oldValue}
                  </pre>
                </div>
              ) : null}
              {entry.newValue?.trim() ? (
                <div className="rounded-[16px] border border-line bg-surface p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {changeLabels.newLabel}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-brand-strong">
                    {entry.newValue}
                  </pre>
                </div>
              ) : null}
            </div>
          </DetailSection>
        ) : (
          <DetailSection
            title="Informations complementaires"
            description="Aucune ancienne ou nouvelle valeur structurée n a ete fournie pour cette operation."
          >
            <div className="rounded-[16px] border border-dashed border-line bg-surface p-4 text-sm text-muted">
              L operation ne contient pas de comparaison de valeurs supplementaire.
            </div>
          </DetailSection>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={backHref} className="button-secondary">
          Retour
        </Link>
      </div>
    </div>
  );
}
