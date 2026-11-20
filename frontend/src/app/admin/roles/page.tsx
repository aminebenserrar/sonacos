import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { DataListCard } from "@/components/workspace/data-list-card";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAdminRoles, getAdminUsers } from "@/lib/api/admin";
import { formatRoleLabel } from "@/lib/formatters";
import { getSessionToken } from "@/lib/auth/guards";

const roleDescriptions: Record<string, string> = {
  ADMIN: "Gestion des comptes, des roles et de la supervision generale.",
  GESTIONNAIRE: "Gestion des produits, du stock, des commandes et des paiements.",
  RESPONSABLE: "Validation des operations sensibles et suivi des decisions.",
  ARCHIVISTE: "Gestion documentaire, consultation des factures et archivage.",
  AUDITEUR: "Controle en lecture seule des operations, du stock et des validations.",
  CLIENT: "Panier, commandes, factures et espace personnel.",
};

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const token = await getSessionToken();
  let roles: string[] | null = null;
  let users: Awaited<ReturnType<typeof getAdminUsers>> | null = null;

  if (token) {
    const [rolesResult, usersResult] = await Promise.allSettled([
      getAdminRoles(token),
      getAdminUsers(token),
    ]);

    if (rolesResult.status === "fulfilled") {
      roles = rolesResult.value;
    }

    if (usersResult.status === "fulfilled") {
      users = usersResult.value;
    }
  }

  if (!roles || !users) {
    return (
      <>
        <WorkspacePageHeader
          title="Gestion des roles"
          description="Consultez les droits attribues a chaque type d utilisateur."
        />
        <DataLoadAlert
          description="La matrice des roles n'a pas pu etre chargee depuis l'API d'administration."
          retryHref="/admin/roles"
        />
      </>
    );
  }

  return (
    <>
      <WorkspacePageHeader
        title="Gestion des roles"
        description="Consultez les droits attribues a chaque type d utilisateur."
      />

      <DataListCard
        title="Matrice des acces"
        items={roles.map((role) => ({
          title: formatRoleLabel(role),
          subtitle: roleDescriptions[role] ?? "Role configure dans l application.",
          value: String(users.filter((user) => user.roles.includes(role)).length),
        }))}
      />
    </>
  );
}
