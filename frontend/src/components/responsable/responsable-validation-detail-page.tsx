"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DetailField, DetailPageHeader, DetailSection } from "@/components/ui/detail-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDateTime } from "@/lib/formatters";
import {
  formatValidationRequesterRole,
  formatValidationStatus,
  formatValidationType,
  getDecisionLabel,
  getRelativeTimeLabel,
  getValidationDecisionImpact,
  getValidationHeadline,
  getValidationRefusalImpact,
  getValidationTypeExplanation,
} from "@/lib/responsable-validations";
import type { ApiErrorResponse } from "@/types/api";
import type { ValidationOperation } from "@/types/validation";

type ResponsableValidationDetailPageProps = {
  initialValidation: ValidationOperation;
  backHref: string;
};

type ActionMode = "approve" | "reject" | null;

export function ResponsableValidationDetailPage({
  initialValidation,
  backHref,
}: ResponsableValidationDetailPageProps) {
  const router = useRouter();
  const [validation, setValidation] = useState(initialValidation);
  const [busy, setBusy] = useState(false);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [rejectionReason, setRejectionReason] = useState(initialValidation.rejectionReason ?? "");
  const [error, setError] = useState<string | null>(null);

  const reviewPoints = useMemo(() => {
    if (validation.status !== "EN_ATTENTE") {
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

  async function handleDecision(status: "VALIDEE" | "REFUSEE") {
    setError(null);

    if (status === "REFUSEE" && !rejectionReason.trim()) {
      setError("Le motif du refus est obligatoire.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`/api/responsable/validations/${validation.id}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          rejectionReason: status === "REFUSEE" ? rejectionReason.trim() : "",
        }),
      });

      const payload = (await response.json()) as ValidationOperation | ApiErrorResponse;
      if (!response.ok) {
        setError((payload as ApiErrorResponse).message);
        return;
      }

      setValidation(payload as ValidationOperation);
      setActionMode(null);
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer cette decision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <DetailPageHeader
        backHref={backHref}
        backLabel="Retour aux validations"
        eyebrow="Validations"
        title="Detail de la demande"
        subtitle={validation.targetReference}
        badges={
          <>
            <StatusBadge value={validation.priority} kind="priority" />
            <StatusBadge value={validation.status} />
          </>
        }
      />

      {error ? (
        <div className="rounded-[14px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <DetailSection
          title="Informations de la demande"
          description={getValidationHeadline(validation)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField
              label="Type de demande"
              value={formatValidationType(validation.operationType)}
            />
            <DetailField label="Reference" value={validation.targetReference} />
            <DetailField label="Date de la demande" value={formatDateTime(validation.requestedAt)} />
            <DetailField label="Priorite" value={formatValidationStatus(validation.priority)} />
          </div>

          <div className="mt-4 rounded-[16px] border border-line bg-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Explication
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-brand-strong">
              {validation.description}
            </p>
          </div>
        </DetailSection>

        <DetailSection title="Demandeur" description="Personne ayant initie la demande.">
          <div className="flex items-start gap-4 rounded-[16px] border border-line bg-surface p-4">
            <UserAvatar name={validation.requesterFullName} size="lg" />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-brand-strong">{validation.requesterFullName}</p>
              <p className="mt-1 text-sm text-muted">
                {validation.requesterEmail || "Adresse e-mail non disponible"}
              </p>
              <div className="mt-3">
                <StatusBadge value={validation.requesterRole} kind="role" />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <DetailField
              label="Role"
              value={formatValidationRequesterRole(validation.requesterRole)}
            />
            <DetailField
              label="Delai"
              value={getRelativeTimeLabel(validation.requestedAt)}
            />
          </div>
        </DetailSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DetailSection
          title="Impact de la decision"
          description="Resume rapide avant validation ou refus."
        >
          <div className="grid gap-4">
            <DetailField
              label="Si vous validez"
              value={getValidationDecisionImpact(validation)}
            />
            <DetailField
              label="Si vous refusez"
              value={getValidationRefusalImpact(validation)}
            />
            <DetailField
              label="Type interne"
              value={getValidationTypeExplanation(validation)}
            />
          </div>
        </DetailSection>

        <DetailSection
          title="Decision et suivi"
          description="Etat actuel de la demande et informations de traitement."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="Statut" value={getDecisionLabel(validation)} />
            <DetailField
              label="Responsable"
              value={validation.responsibleFullName || "En attente"}
            />
            <DetailField
              label="Decision prise le"
              value={
                validation.decidedAt ? formatDateTime(validation.decidedAt) : "Pas encore traitee"
              }
            />
            <DetailField
              label="Role du demandeur"
              value={formatValidationRequesterRole(validation.requesterRole)}
            />
          </div>

          {validation.rejectionReason ? (
            <div className="mt-4 rounded-[16px] border border-danger/20 bg-danger/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-danger">
                Motif du refus
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-danger">
                {validation.rejectionReason}
              </p>
            </div>
          ) : null}
        </DetailSection>
      </div>

      {reviewPoints.length > 0 ? (
        <DetailSection
          title="Points a verifier"
          description="Elements utiles avant de prendre une decision sur cette demande."
        >
          <ul className="grid gap-3 text-sm leading-6 text-brand-strong">
            {reviewPoints.map((point) => (
              <li key={point} className="flex gap-3 rounded-[14px] border border-line bg-surface p-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {validation.status === "EN_ATTENTE" ? (
        <DetailSection
          title="Prendre une decision"
          description="Utilisez cette zone pour valider ou refuser la demande."
        >
          {actionMode === "approve" ? (
            <div className="rounded-[18px] border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-brand-strong">
                Valider {validation.targetReference} ?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {getValidationDecisionImpact(validation)}
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
                  onClick={() => handleDecision("VALIDEE")}
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
                  onClick={() => handleDecision("REFUSEE")}
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
        </DetailSection>
      ) : null}
    </div>
  );
}
