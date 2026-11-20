import Link from "next/link";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ActionListCard } from "@/components/workspace/action-list-card";
import { DataListCard } from "@/components/workspace/data-list-card";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { ShieldIcon, UsersIcon, UserIcon } from "@/components/ui/store-icons";
import { getAdminRoles, getAdminUsers } from "@/lib/api/admin";
import { getSessionToken } from "@/lib/auth/guards";
import { formatRoleLabel } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const token = await getSessionToken();
  let roles: string[] | null = null;
  let users: Awaited<ReturnType<typeof getAdminUsers>> | null = null;
  const loadErrors: string[] = [];

  if (token) {
    const [rolesResult, usersResult] = await Promise.allSettled([
      getAdminRoles(token),
      getAdminUsers(token),
    ]);

    if (rolesResult.status === "fulfilled") {
      roles = rolesResult.value;
    } else {
      loadErrors.push("les roles");
    }

    if (usersResult.status === "fulfilled") {
      users = usersResult.value;
    } else {
      loadErrors.push("les utilisateurs");
    }
  }

  const safeRoles = roles ?? [];
  const safeUsers = users ?? [];

  const activeUsers = safeUsers.filter((user) => user.active).length;
  const inactiveUsers = safeUsers.length - activeUsers;

  const metrics = [
    {
      label: "Utilisateurs",
      value: users ? String(safeUsers.length).padStart(2, "0") : "--",
      detail: "comptes enregistres dans l application",
      icon: "users" as const,
    },
    {
      label: "Comptes actifs",
      value: users ? String(activeUsers).padStart(2, "0") : "--",
      detail: "acces actuellement autorises",
      icon: "check" as const,
    },
    {
      label: "Comptes inactifs",
      value: users ? String(inactiveUsers).padStart(2, "0") : "--",
      detail: "comptes a recontroler ou reactiver",
      icon: "stock" as const,
    },
    {
      label: "Roles definis",
      value: roles ? String(safeRoles.length).padStart(2, "0") : "--",
      detail: "profils d acces disponibles",
      icon: "chart" as const,
    },
  ];

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Administration"
        title="Tableau de bord"
        description="Supervisez les comptes, les roles et les acces depuis un espace d administration plus lisible."
        breadcrumbs={[
          { label: "Administration" },
          { label: "Tableau de bord" },
        ]}
        actions={
          <>
            <Link href="/admin/roles" className="button-secondary">
              Voir les roles
            </Link>
            <Link href="/admin/utilisateurs" className="button-primary">
              Gerer les utilisateurs
            </Link>
          </>
        }
      />

      {loadErrors.length > 0 ? (
        <DataLoadAlert
          description={`Certaines donnees d'administration n'ont pas pu etre chargees : ${loadErrors.join(", ")}.`}
          retryHref="/admin"
        />
      ) : null}

      <MetricGrid items={metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <DataListCard
          title="Comptes recents"
          action={
            <Link href="/admin/utilisateurs" className="button-tertiary">
              Voir tout
            </Link>
          }
          items={safeUsers.slice(0, 8).map((user) => ({
            title: user.fullName,
            subtitle: `${user.email} · ${user.roles.map(formatRoleLabel).join(", ")}`,
            status: user.active ? "ACTIF" : "INACTIF",
          }))}
          emptyMessage="Les nouveaux comptes crees apparaitront ici."
        />

        <ActionListCard
          title="Actions rapides"
          description="Accedez directement aux operations administratives les plus frequentes."
          items={[
            {
              href: "/admin/utilisateurs",
              label: "Consulter les utilisateurs",
              description: "Modifier les comptes, activer ou desactiver un acces.",
              icon: <UsersIcon className="h-4 w-4" />,
            },
            {
              href: "/admin/roles",
              label: "Verifier les roles",
              description: "Controler les profils disponibles dans la plateforme.",
              icon: <ShieldIcon className="h-4 w-4" />,
            },
            {
              href: "/admin/activite",
              label: "Consulter le journal",
              description: "Relire les creations, changements de roles et actions sensibles.",
              icon: <UsersIcon className="h-4 w-4" />,
            },
            {
              href: "/profil",
              label: "Mettre a jour mon profil",
              description: "Verifier vos informations et la securite de votre compte.",
              icon: <UserIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataListCard
          title="Repartition des profils"
          items={safeRoles.map((role) => ({
            title: formatRoleLabel(role),
            subtitle: "Utilisateurs rattaches a ce profil",
            value: String(safeUsers.filter((user) => user.roles.includes(role)).length),
          }))}
          emptyMessage="Les roles disponibles apparaitront ici."
        />

        <DataListCard
          title="Suivi des acces"
          items={[
            {
              title: "Comptes actifs",
              subtitle: "Utilisateurs qui peuvent se connecter",
              value: String(activeUsers),
              status: "ACTIF",
            },
            {
              title: "Comptes inactifs",
              subtitle: "Utilisateurs a revalider",
              value: String(inactiveUsers),
              status: "INACTIF",
            },
            {
              title: "Clients",
              subtitle: "Comptes de l espace commercial",
              value: String(safeUsers.filter((user) => user.roles.includes("CLIENT")).length),
            },
            {
              title: "Equipes internes",
              subtitle: "Administration, gestion et validation",
              value: String(
                safeUsers.filter((user) =>
                  user.roles.some((role) => role !== "CLIENT"),
                ).length,
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
