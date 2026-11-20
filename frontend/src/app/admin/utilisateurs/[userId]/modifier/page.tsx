import Link from "next/link";
import { AdminUserEditForm } from "@/components/admin/admin-user-edit-form";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAdminRoles, getAdminUsers } from "@/lib/api/admin";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AdminUserEditPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  const token = await getSessionToken();
  const { userId } = await params;
  const numericUserId = Number(userId);

  if (!Number.isFinite(numericUserId)) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-5 w-5" />}
        title="Utilisateur introuvable"
        description="L identifiant utilisateur est invalide."
        action={
          <Link href="/admin/utilisateurs" className="button-primary">
            Retour aux utilisateurs
          </Link>
        }
      />
    );
  }

  let users: Awaited<ReturnType<typeof getAdminUsers>> | null = null;
  let roles: Awaited<ReturnType<typeof getAdminRoles>> | null = null;

  if (token) {
    const [usersResult, rolesResult] = await Promise.allSettled([
      getAdminUsers(token),
      getAdminRoles(token),
    ]);

    if (usersResult.status === "fulfilled") {
      users = usersResult.value;
    }

    if (rolesResult.status === "fulfilled") {
      roles = rolesResult.value;
    }
  }

  const user = users?.find((item) => item.id === numericUserId) ?? null;

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Administration"
        title="Modifier l'utilisateur"
        description="Modifiez les informations, le role et le statut de cet utilisateur."
        breadcrumbs={[
          { label: "Administration" },
          { label: "Utilisateurs" },
          { label: "Modifier" },
        ]}
        actions={
          <Link href="/admin/utilisateurs" className="button-secondary">
            Retour aux utilisateurs
          </Link>
        }
      />

      {!users || !roles ? (
        <DataLoadAlert
          description="Impossible de charger les donnees de modification depuis l API d administration."
          retryHref={`/admin/utilisateurs/${numericUserId}/modifier`}
        />
      ) : !user ? (
        <EmptyState
          icon={<UsersIcon className="h-5 w-5" />}
          title="Utilisateur introuvable"
          description="Ce compte n existe pas ou n est plus disponible."
          action={
            <Link href="/admin/utilisateurs" className="button-primary">
              Retour aux utilisateurs
            </Link>
          }
        />
      ) : (
        <AdminUserEditForm user={user} availableRoles={roles} />
      )}
    </>
  );
}
