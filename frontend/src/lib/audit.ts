import type { AuditLogEntry } from "@/types/audit";

export function formatAuditAction(actionType: string) {
  const labels: Record<string, string> = {
    CREATE_USER: "Creation utilisateur",
    UPDATE_USER: "Modification utilisateur",
    ACTIVATE_USER: "Activation compte",
    DEACTIVATE_USER: "Desactivation compte",
    UPDATE_USER_ROLES: "Modification des roles",
    CREATE_PRODUCT: "Creation produit",
    UPDATE_PRODUCT: "Modification produit",
    UPDATE_STOCK: "Mouvement de stock",
    UPDATE_PAYMENT_STATUS: "Mise a jour du paiement",
    CREATE_ORDER: "Creation commande",
    VALIDATE_OPERATION: "Validation operation",
    REFUSE_OPERATION: "Refus operation",
    ARCHIVE_DOCUMENT: "Archivage document",
    UPDATE_PROFILE: "Mise a jour profil",
    CHANGE_PASSWORD: "Changement mot de passe",
  };

  return labels[actionType] ?? actionType.replaceAll("_", " ").toLowerCase();
}

export function formatAuditModule(module: string) {
  const labels: Record<string, string> = {
    USER: "Utilisateur",
    PRODUCT: "Produit",
    STOCK: "Stock",
    ORDER: "Commande",
    PAYMENT: "Paiement",
    VALIDATION: "Validation",
    INVOICE: "Document",
  };

  return labels[module] ?? module;
}

export function getAuditReferenceLabel(entry: AuditLogEntry) {
  switch (entry.objectType) {
    case "ORDER":
      return "Reference commande";
    case "STOCK":
      return "Reference produit";
    case "PAYMENT":
      return "Reference paiement";
    case "VALIDATION":
      return "Reference validation";
    case "INVOICE":
      return "Reference document";
    case "USER":
      return "Utilisateur concerne";
    default:
      return "Reference";
  }
}

export function getAuditChangeLabels(entry: AuditLogEntry) {
  if (entry.objectType === "STOCK") {
    return {
      oldLabel: "Ancienne quantite",
      newLabel: "Nouvelle quantite",
    };
  }

  if (entry.objectType === "PAYMENT") {
    return {
      oldLabel: "Statut precedent",
      newLabel: "Nouveau statut",
    };
  }

  if (entry.objectType === "VALIDATION") {
    return {
      oldLabel: "Statut precedent",
      newLabel: "Decision",
    };
  }

  if (entry.objectType === "INVOICE") {
    return {
      oldLabel: "Statut precedent",
      newLabel: "Nouveau statut",
    };
  }

  if (entry.actionType === "UPDATE_USER_ROLES") {
    return {
      oldLabel: "Ancien role",
      newLabel: "Nouveau role",
    };
  }

  if (entry.objectType === "USER") {
    return {
      oldLabel: "Ancienne valeur",
      newLabel: "Nouvelle valeur",
    };
  }

  return {
    oldLabel: "Avant",
    newLabel: "Apres",
  };
}

export function hasAuditChange(entry: AuditLogEntry) {
  return Boolean(entry.oldValue?.trim() || entry.newValue?.trim());
}
