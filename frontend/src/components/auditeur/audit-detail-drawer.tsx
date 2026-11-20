"use client";

import { useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { XIcon } from "@/components/ui/store-icons";
import {
  formatAuditAction,
  formatAuditModule,
  getAuditChangeLabels,
  getAuditReferenceLabel,
  hasAuditChange,
} from "@/lib/audit";
import { formatDateTime } from "@/lib/formatters";
import type { AuditLogEntry } from "@/types/audit";

type AuditDetailDrawerProps = {
  audit: AuditLogEntry | null;
  open: boolean;
  onClose: () => void;
};

type DetailRowProps = {
  label: string;
  value: string;
  preserveWhitespace?: boolean;
};

function DetailRow({ label, value, preserveWhitespace = false }: DetailRowProps) {
  return (
    <div className="grid gap-1.5 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p
        className={`text-sm leading-6 text-brand-strong ${
          preserveWhitespace ? "whitespace-pre-wrap break-words" : "break-words"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line/70 px-5 py-5 sm:px-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>
      <div className="mt-3 divide-y divide-line/50">{children}</div>
    </section>
  );
}

function getContextRows(audit: AuditLogEntry) {
  const rows = [
    {
      label: getAuditReferenceLabel(audit),
      value: audit.objectIdentifier,
    },
  ];

  if (audit.objectType === "USER" && audit.performedByFullName) {
    rows.push({
      label: "Operateur",
      value: audit.performedByFullName,
    });
  }

  return rows;
}

export function AuditDetailDrawer({
  audit,
  open,
  onClose,
}: AuditDetailDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !audit) {
    return null;
  }

  const changeLabels = getAuditChangeLabels(audit);
  const contextRows = getContextRows(audit);

  return (
    <div
      className="fixed inset-0 z-[90] bg-brand-strong/18 backdrop-blur-[2px]"
      onClick={onClose}
      aria-hidden="true"
    >
      <aside
        className="absolute right-0 top-0 h-dvh w-full max-w-[560px] overflow-y-auto border-l border-line/70 bg-background shadow-[0_20px_60px_rgba(15,41,28,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-detail-title"
        aria-describedby="audit-detail-subtitle"
      >
        <div className="sticky top-0 z-10 border-b border-line/70 bg-background/96 px-5 py-5 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Journal d&apos;audit
              </p>
              <h2
                id="audit-detail-title"
                className="mt-2 font-heading text-2xl font-semibold text-brand-strong"
              >
                Detail de l&apos;operation
              </h2>
              <p id="audit-detail-subtitle" className="mt-2 text-sm text-muted">
                {audit.objectIdentifier}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              aria-label="Fermer le detail de l'operation"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <DetailSection title="Operation">
          <DetailRow label="Date et heure" value={formatDateTime(audit.createdAt)} />
          <DetailRow label="Action" value={formatAuditAction(audit.actionType)} />
          <DetailRow label="Module" value={formatAuditModule(audit.objectType)} />
          <DetailRow label="Reference" value={audit.objectIdentifier} />
          <div className="grid gap-1.5 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Niveau
            </p>
            <div>
              <StatusBadge value={audit.level} />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Utilisateur">
          <DetailRow label="Nom complet" value={audit.performedByFullName} />
          {audit.performedByEmail ? (
            <DetailRow label="Email" value={audit.performedByEmail} />
          ) : null}
          <div className="grid gap-1.5 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Role
            </p>
            <div>
              <StatusBadge value={audit.performedByRole} kind="role" />
            </div>
          </div>
        </DetailSection>

        <DetailSection title={formatAuditModule(audit.objectType)}>
          {contextRows.map((row) => (
            <DetailRow key={row.label} label={row.label} value={row.value} />
          ))}
        </DetailSection>

        {audit.description ? (
          <DetailSection title="Description">
            <DetailRow
              label="Detail"
              value={audit.description}
              preserveWhitespace
            />
          </DetailSection>
        ) : null}

        {hasAuditChange(audit) ? (
          <DetailSection title="Modification">
            {audit.oldValue?.trim() ? (
              <DetailRow
                label={changeLabels.oldLabel}
                value={audit.oldValue}
                preserveWhitespace
              />
            ) : null}
            {audit.newValue?.trim() ? (
              <DetailRow
                label={changeLabels.newLabel}
                value={audit.newValue}
                preserveWhitespace
              />
            ) : null}
          </DetailSection>
        ) : null}

        <div className="border-t border-line/70 px-5 py-5 sm:px-6">
          <button type="button" onClick={onClose} className="button-secondary">
            Fermer
          </button>
        </div>
      </aside>
    </div>
  );
}
