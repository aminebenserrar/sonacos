import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireSession } from "@/lib/auth/guards";
import { getWorkspaceShellProps } from "@/lib/workspace/navigation";

export default async function AuditeurLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession(["AUDITEUR"]);
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
