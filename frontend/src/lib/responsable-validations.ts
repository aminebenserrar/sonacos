import { formatRoleLabel, formatStatusLabel } from "@/lib/formatters";
import type { ValidationOperation } from "@/types/validation";

const priorityOrder = {
  HAUTE: 0,
  MOYENNE: 1,
  NORMALE: 2,
} as const;

export function getPriorityRank(priority: string) {
  return priorityOrder[priority as keyof typeof priorityOrder] ?? 99;
}

export function formatValidationType(operationType: string) {
  const labels: Record<string, string> = {
    STOCK: "Sortie exceptionnelle de stock",
    PAIEMENT: "Confirmation de paiement",
    COMMANDE: "Demande exceptionnelle sur une commande",
    AUTRE: "Operation sensible",
  };

  return labels[operationType] ?? operationType;
}

export function getValidationHeadline(item: ValidationOperation) {
  switch (item.operationType) {
    case "STOCK":
      return `${item.requesterFullName} demande l'autorisation d'effectuer une operation sensible de stock.`;
    case "PAIEMENT":
      return `${item.requesterFullName} demande l'autorisation de confirmer un paiement en attente.`;
    case "COMMANDE":
      return `${item.requesterFullName} demande l'autorisation de traiter une commande exceptionnelle.`;
    default:
      return `${item.requesterFullName} demande votre autorisation pour une operation sensible.`;
  }
}

export function getValidationImpactLabel(item: ValidationOperation) {
  switch (item.operationType) {
    case "STOCK":
      return "Operation de stock sensible";
    case "PAIEMENT":
      return "Paiement en attente a confirmer";
    case "COMMANDE":
      return "Traitement manuel d'une commande";
    default:
      return "Controle complementaire necessaire";
  }
}

export function getValidationDecisionImpact(item: ValidationOperation) {
  switch (item.operationType) {
    case "STOCK":
      return "Apres validation, l'equipe pourra executer cette operation de stock.";
    case "PAIEMENT":
      return "Apres validation, le paiement pourra etre confirme et la demande cloturee.";
    case "COMMANDE":
      return "Apres validation, la commande pourra suivre son traitement exceptionnel.";
    default:
      return "Apres validation, cette demande sera autorisee pour execution.";
  }
}

export function getValidationRefusalImpact(item: ValidationOperation) {
  switch (item.operationType) {
    case "STOCK":
      return "Si vous refusez, cette operation de stock restera bloquee jusqu'a nouvelle demande.";
    case "PAIEMENT":
      return "Si vous refusez, le paiement restera non confirme jusqu'a correction du dossier.";
    case "COMMANDE":
      return "Si vous refusez, la commande ne pourra pas suivre ce traitement exceptionnel.";
    default:
      return "Si vous refusez, la demande restera non autorisee jusqu'a nouvelle instruction.";
  }
}

export function getValidationTypeExplanation(item: ValidationOperation) {
  switch (item.operationType) {
    case "STOCK":
      return "Demande de stock";
    case "PAIEMENT":
      return "Demande de paiement";
    case "COMMANDE":
      return "Demande de commande";
    default:
      return "Demande sensible";
  }
}

export function getRelativeTimeLabel(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  const minutes = Math.round(Math.abs(diff) / 60_000);

  if (minutes < 1) {
    return "A l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days = Math.round(hours / 24);
  return `Il y a ${days} j`;
}

export function getResponsableSummary(
  pendingCount: number,
  urgentCount: number,
) {
  if (pendingCount === 0) {
    return "Tout est a jour. Aucune demande en attente.";
  }

  if (urgentCount > 0) {
    return `${pendingCount} demandes necessitent votre decision, dont ${urgentCount} prioritaires.`;
  }

  return `${pendingCount} demandes necessitent votre decision.`;
}

export function getDecisionLabel(item: ValidationOperation) {
  if (item.status === "VALIDEE") {
    return "Validee";
  }

  if (item.status === "REFUSEE") {
    return "Refusee";
  }

  return formatStatusLabel(item.status);
}

export function formatValidationStatus(status: string) {
  return formatStatusLabel(status);
}

export function formatValidationRequesterRole(role: string) {
  return formatRoleLabel(role);
}
