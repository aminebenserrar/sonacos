export function formatCurrency(value: number, currencyLabel: "MAD" | "DH" = "MAD") {
  return (
    new Intl.NumberFormat("fr-MA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ` ${currencyLabel}`
  );
}

export function formatDateShort(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateLong(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  return formatted.replace(",", " à");
}

export function formatRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: "Administrateur",
    GESTIONNAIRE: "Gestionnaire",
    RESPONSABLE: "Responsable",
    ARCHIVISTE: "Archiviste",
    AUDITEUR: "Auditeur",
    CLIENT: "Client",
  };

  return labels[role] ?? role;
}

export function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Non défini";
  }

  const labels: Record<string, string> = {
    EN_ATTENTE: "En attente",
    CONFIRMEE: "Confirmée",
    EN_PREPARATION: "En préparation",
    PRETE: "Prête",
    EXPEDIEE: "Expédiée",
    LIVREE: "Livrée",
    ANNULEE: "Annulée",
    REFUSEE: "Refusée",
    REFUSE: "Refusé",
    VALIDEE: "Validée",
    VALIDE: "Validé",
    REMBOURSE: "Remboursé",
    ACTIF: "Actif",
    INACTIF: "Inactif",
    ENTREE: "Entrée",
    SORTIE: "Sortie",
    RESERVATION: "Réservation",
    ANNULATION_RESERVATION: "Annulation",
    AJUSTEMENT: "Ajustement",
    LIVRAISON: "Livraison",
    RETRAIT_CENTRE: "Retrait centre",
    PAIEMENT_SUR_PLACE: "Paiement sur place",
    VIREMENT_BANCAIRE: "Virement bancaire",
    VIREMENT: "Virement bancaire",
    CARTE_SIMULEE: "Carte simulée",
    HAUTE: "Haute",
    MOYENNE: "Moyenne",
    NORMALE: "Faible",
    DISPONIBLE: "Disponible",
    RUPTURE: "Rupture",
    STOCK_FAIBLE: "Stock faible",
    ARCHIVE: "Archivé",
    A_ARCHIVER: "À archiver",
    INFORMATION: "Information",
    IMPORTANT: "Important",
    SENSIBLE: "Sensible",
  };

  return labels[status] ?? status.replaceAll("_", " ").toLowerCase();
}

export function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
