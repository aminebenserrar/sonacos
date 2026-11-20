"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { XIcon } from "@/components/ui/store-icons";
import {
  formatValidationRequesterRole,
  formatValidationStatus,
  formatValidationType,
  getRelativeTimeLabel,
  getValidationDecisionImpact,
  getValidationHeadline,
  getValidationRefusalImpact,
  getValidationTypeExplanation,
} from "@/lib/responsable-validations";
import { formatDateTime } from "@/lib/formatters";
import type { ValidationOperation } from "@/types/validation";

type ResponsableValidationDrawerProps = {
  validation: ValidationOperation | null;
  open: boolean;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onApprove: (validationId: number) => Promise<void>;
  onReject: (validationId: number, reason: string) => Promise<void>;
};

type ActionMode = "approve" | "reject" | null;

type SectionRowProps = {
  label: string;
  value: string;
  preserveWhitespace?: boolean;
};

function SectionRow({
  label,
  value,
  preserveWhitespace = false,
}: SectionRowProps) {
  return (
    <div className="grid gap-1.5 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
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

function DrawerSection({
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

export function ResponsableValidationDrawer({
  validation,
  open,
  busy,
  error,
  onClose,
  onApprove,
  onReject,
}: ResponsableValidationDrawerProps) {
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [rejectionReason, setRejectionReason] = useState(
    validation?.rejectionReason ?? "",
  );
  const [localError, setLocalError] = useState<string | null>(null);

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

  const reviewPoints = useMemo(() => {
    if (!validation || validation.status !== "EN_ATTENTE") {
      return [];
    }

    const items = [
      `Priorite actuelle : ${formatValidationStatus(validation.priority)}`,
      `Demande en attente depuis ${getRelativeTimeLabel(validation.requestedAt).toLowerCase()}`,
    ];

    if (validation.description.trim()) {
      items.push("Une justification metier est disponible dans la description.");
    }

    return items;
  }, [validation]);

  if (!open || !validation) {
    return null;
  }

  const currentValidation = validation;

  async function handleApprove() {
    setLocalError(null);
    await onApprove(currentValidation.id);
    setActionMode(null);
  }

  async function handleReject() {
    setLocalError(null);

    if (!rejectionReason.trim()) {
      setLocalError("Le motif du refus est obligatoire.");
      return;
    }

    await onReject(currentValidation.id, rejectionReason.trim());
    setActionMode(null);
  }

  const effectiveError = localError ?? error;

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
        aria-labelledby="responsable-validation-title"
        aria-describedby="responsable-validation-subtitle"
      >
        <div className="sticky top-0 z-10 border-b border-line/70 bg-background/96 px-5 py-5 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Demande
              </p>
              <h2
                id="responsable-validation-title"
                className="mt-2 font-heading text-2xl font-semibold text-brand-strong"
              >
                Examiner la demande
              </h2>
              <p
                id="responsable-validation-subtitle"
                className="mt-2 text-sm text-muted"
              >
                {currentValidation.targetReference}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              aria-label="Fermer l'examen de la demande"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted">
            {getValidationHeadline(currentValidation)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge value={currentValidation.priority} kind="priority" />
            <StatusBadge value={currentValidation.status} />
          </div>
        </div>

        {effectiveError ? (
          <div className="px-5 pt-5 sm:px-6">
            <div className="rounded-[14px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
              {effectiveError}
            </div>
          </div>
        ) : null}

        <DrawerSection title="Ce qui va changer">
          <SectionRow
            label="Type de demande"
            value={formatValidationType(currentValidation.operationType)}
          />
          <SectionRow
            label="Impact si vous validez"
            value={getValidationDecisionImpact(currentValidation)}
            preserveWhitespace
          />
          <SectionRow
            label="Si vous refusez"
            value={getValidationRefusalImpact(currentValidation)}
            preserveWhitespace
          />
        </DrawerSection>

        <DrawerSection title="Pourquoi cette demande ?">
          <SectionRow
            label="Explication"
            value={currentValidation.description}
            preserveWhitespace
          />
        </DrawerSection>

        <DrawerSection title="Demandeur">
          <SectionRow label="Nom complet" value={currentValidation.requesterFullName} />
          {currentValidation.requesterEmail ? (
            <SectionRow label="Email" value={currentValidation.requesterEmail} />
          ) : null}
          <SectionRow
            label="Role"
            value={formatValidationRequesterRole(currentValidation.requesterRole)}
          />
          <SectionRow
            label="Date de la demande"
            value={formatDateTime(currentValidation.requestedAt)}
          />
        </DrawerSection>

        {reviewPoints.length > 0 ? (
          <section className="border-t border-line/70 px-5 py-5 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              A verifier avant de valider
            </h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-brand-strong">
              {reviewPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-brand" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {currentValidation.status !== "EN_ATTENTE" ? (
          <DrawerSection title="Decision prise">
            <SectionRow
              label="Decision"
              value={currentValidation.status === "VALIDEE" ? "Validee" : "Refusee"}
            />
            <SectionRow
              label="Decision prise par"
              value={currentValidation.responsibleFullName}
            />
            {currentValidation.decidedAt ? (
              <SectionRow
                label="Le"
                value={formatDateTime(currentValidation.decidedAt)}
              />
            ) : null}
            {currentValidation.rejectionReason ? (
              <SectionRow
                label="Motif"
                value={currentValidation.rejectionReason}
                preserveWhitespace
              />
            ) : null}
          </DrawerSection>
        ) : null}

        <details className="border-t border-line/70 px-5 py-5 sm:px-6">
          <summary className="cursor-pointer text-sm font-semibold text-brand-strong">
            Details techniques
          </summary>
            <div className="mt-3 divide-y divide-line/50">
            <SectionRow label="Reference" value={currentValidation.targetReference} />
            <SectionRow
              label="Type interne"
              value={getValidationTypeExplanation(currentValidation)}
            />
            <SectionRow
              label="Statut"
              value={formatValidationStatus(currentValidation.status)}
            />
          </div>
        </details>

        {currentValidation.status === "EN_ATTENTE" ? (
          <div className="border-t border-line/70 px-5 py-5 sm:px-6">
            {actionMode === "approve" ? (
              <div className="rounded-[18px] border border-line bg-surface p-4">
                <p className="text-sm font-semibold text-brand-strong">
                  Valider {currentValidation.targetReference} ?
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {getValidationDecisionImpact(currentValidation)}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setActionMode(null)}
                    disabled={busy}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={handleApprove}
                    disabled={busy}
                  >
                    {busy ? "Validation..." : "Valider"}
                  </button>
                </div>
              </div>
            ) : actionMode === "reject" ? (
              <div className="rounded-[18px] border border-line bg-surface p-4">
                <label className="text-sm font-semibold text-brand-strong">
                  Motif du refus *
                  <textarea
                    className="form-control mt-3 min-h-[120px] py-3"
                    placeholder="Expliquez brievement pourquoi cette demande est refusee."
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setActionMode(null)}
                    disabled={busy}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={handleReject}
                    disabled={busy}
                  >
                    {busy ? "Traitement..." : "Confirmer le refus"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setActionMode("reject")}
                  disabled={busy}
                >
                  Refuser
                </button>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setActionMode("approve")}
                  disabled={busy}
                >
                  Valider la demande
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-line/70 px-5 py-5 sm:px-6">
            <button type="button" onClick={onClose} className="button-secondary">
              Fermer
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
