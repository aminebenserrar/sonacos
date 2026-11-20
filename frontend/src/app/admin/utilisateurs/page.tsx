import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { AdminUsersManagement } from "@/components/admin/admin-users-management";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAdminRoles, getAdminUsers } from "@/lib/api/admin";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const token = await getSessionToken();
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

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Administration"
        title="Gestion des utilisateurs"
        description="Activation, desactivation et attribution des roles utilisateurs."
        breadcrumbs={[
          { label: "Administration" },
          { label: "Utilisateurs" },
        ]}
      />

      {users && roles ? (
        <AdminUsersManagement initialUsers={users} availableRoles={roles} />
      ) : (
        <DataLoadAlert
          description="Les utilisateurs ou les roles n'ont pas pu etre charges depuis l'API d'administration."
          retryHref="/admin/utilisateurs"
        />
      )}
    </>
  );
}
