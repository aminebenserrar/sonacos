import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ProfileManagement } from "@/components/profile/profile-management";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getMyProfile } from "@/lib/api/auth";
import { getSessionToken, requireSession } from "@/lib/auth/guards";
import { getWorkspaceShellProps } from "@/lib/workspace/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession([
    "ADMIN",
    "GESTIONNAIRE",
    "RESPONSABLE",
    "ARCHIVISTE",
    "AUDITEUR",
    "CLIENT",
  ]);
  const token = await getSessionToken();
  let profile: Awaited<ReturnType<typeof getMyProfile>> | null = null;

  if (token) {
    try {
      profile = await getMyProfile(token);
    } catch {
      profile = null;
    }
  }
  const shell = getWorkspaceShellProps(session);

  return (
    <WorkspaceShell
      role={shell.role}
      navSections={shell.navSections}
      session={session}
    >
      <WorkspacePageHeader
        eyebrow="Compte"
        title="Mon profil"
        description="Gerez vos informations personnelles, vos coordonnees et la securite de votre compte."
        breadcrumbs={[
          { label: "Espace securise" },
          { label: "Mon profil" },
        ]}
      />
      {!profile ? (
        <DataLoadAlert
          description="Le profil detaille n'a pas pu etre charge. Les informations de session locales sont affichees a la place."
          retryHref="/profil"
        />
      ) : null}
      <ProfileManagement
        initialProfile={
          profile ?? {
            id: session.id,
            firstName: session.firstName,
            lastName: session.lastName,
            fullName: session.fullName,
            email: session.email,
            phone: session.phone,
            address: session.address,
            city: session.city,
            active: true,
            roles: session.roles,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      />
    </WorkspaceShell>
  );
}
