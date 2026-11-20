import { notFound, redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/guards";
import { getSessionWorkspacePath } from "@/lib/auth/session";

export default async function MonEspacePage() {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/login");
  }

  const workspacePath = getSessionWorkspacePath(session);

  if (!workspacePath) {
    notFound();
  }

  redirect(workspacePath);
}
