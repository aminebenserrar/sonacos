import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireSession } from "@/lib/auth/guards";
import { getWorkspaceShellProps } from "@/lib/workspace/navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession(["ADMIN"]);
  const shell = getWorkspaceShellProps(session);

  return (
    <WorkspaceShell
      role={shell.role}
      navSections={shell.navSections}
      session={session}
    >
      {children}
    </WorkspaceShell>
  );
}
