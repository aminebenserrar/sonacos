import { formatRoleLabel } from "@/lib/formatters";
import type { RoleCode, SessionUser } from "@/types/auth";

export type WorkspaceNavIcon =
  | "grid"
  | "cart"
  | "receipt"
  | "clipboard"
  | "package"
  | "credit-card"
  | "check"
  | "users"
  | "shield"
  | "settings"
  | "archive";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  icon: WorkspaceNavIcon;
};

export type WorkspaceNavSection = {
  label: string;
  items: WorkspaceNavItem[];
};

const navigationByRole: Record<RoleCode, WorkspaceNavSection[]> = {
  ADMIN: [
    {
      label: "Principal",
      items: [{ href: "/admin", label: "Tableau de bord", icon: "grid" }],
    },
    {
      label: "Administration",
      items: [
        { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users" },
        { href: "/admin/roles", label: "Rôles", icon: "shield" },
        { href: "/admin/activite", label: "Journal d'activité", icon: "clipboard" },
      ],
    },
    {
      label: "Compte",
      items: [{ href: "/profil", label: "Mon profil", icon: "settings" }],
    },
  ],
  GESTIONNAIRE: [
    {
      label: "Principal",
      items: [{ href: "/gestionnaire", label: "Tableau de bord", icon: "grid" }],
    },
    {
      label: "Gestion",
      items: [
        { href: "/gestionnaire/produits", label: "Produits", icon: "package" },
        { href: "/gestionnaire/stock", label: "Stock", icon: "clipboard" },
        { href: "/gestionnaire/commandes", label: "Commandes", icon: "cart" },
        { href: "/gestionnaire/paiements", label: "Paiements", icon: "credit-card" },
      ],
    },
    {
      label: "Compte",
      items: [{ href: "/profil", label: "Mon profil", icon: "settings" }],
    },
  ],
  RESPONSABLE: [
    {
      label: "Principal",
      items: [{ href: "/responsable", label: "Tableau de bord", icon: "grid" }],
    },
    {
      label: "Validation",
      items: [{ href: "/responsable/validations", label: "Validations", icon: "check" }],
    },
    {
      label: "Compte",
      items: [{ href: "/profil", label: "Mon profil", icon: "settings" }],
    },
  ],
  ARCHIVISTE: [
    {
      label: "Principal",
      items: [{ href: "/archiviste", label: "Tableau de bord", icon: "grid" }],
    },
    {
      label: "Documents",
      items: [
        { href: "/archiviste/documents", label: "Documents", icon: "clipboard" },
        { href: "/archiviste/factures", label: "Factures", icon: "receipt" },
        { href: "/archiviste/archives", label: "Archives", icon: "shield" },
      ],
    },
    {
      label: "Compte",
      items: [{ href: "/profil", label: "Mon profil", icon: "settings" }],
    },
  ],
  AUDITEUR: [
    {
      label: "Principal",
      items: [{ href: "/auditeur", label: "Tableau de bord", icon: "grid" }],
    },
    {
      label: "Contrôle",
      items: [
        { href: "/auditeur/journal", label: "Journal des opérations", icon: "clipboard" },
        { href: "/auditeur/commandes", label: "Commandes", icon: "cart" },
        { href: "/auditeur/paiements", label: "Paiements", icon: "credit-card" },
        { href: "/auditeur/factures", label: "Factures", icon: "receipt" },
        { href: "/auditeur/stock", label: "Stock", icon: "package" },
        { href: "/auditeur/validations", label: "Validations", icon: "check" },
      ],
    },
    {
      label: "Compte",
      items: [{ href: "/profil", label: "Mon profil", icon: "settings" }],
    },
  ],
  CLIENT: [
    {
      label: "Principal",
      items: [{ href: "/espace-client", label: "Tableau de bord", icon: "grid" }],
    },
    {
      label: "Achats",
      items: [
        { href: "/espace-client/commandes", label: "Mes commandes", icon: "clipboard" },
        { href: "/espace-client/panier", label: "Mon panier", icon: "cart" },
        { href: "/espace-client/factures", label: "Mes factures", icon: "receipt" },
      ],
    },
    {
      label: "Compte",
      items: [{ href: "/profil", label: "Mon profil", icon: "settings" }],
    },
  ],
};

export function getWorkspaceNav(role: RoleCode) {
  return navigationByRole[role];
}

export function getWorkspaceRoleLabel(role: RoleCode) {
  return formatRoleLabel(role);
}

export function getWorkspaceShellProps(session: SessionUser) {
  return {
    role: getWorkspaceRoleLabel(session.primaryRole),
    navSections: getWorkspaceNav(session.primaryRole),
  };
}
