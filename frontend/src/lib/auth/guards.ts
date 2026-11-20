import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RoleCode } from "@/types/auth";
import {
  AUTH_TOKEN_COOKIE,
  AUTH_USER_COOKIE,
  decodeSessionUser,
  getRoleDashboardPath,
  hasRequiredRole,
} from "@/lib/auth/session";

export async function getOptionalSession() {
  const cookieStore = await cookies();
  return decodeSessionUser(cookieStore.get(AUTH_USER_COOKIE)?.value);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function requireSession(allowedRoles?: RoleCode[]) {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/login");
  }

  if (!hasRequiredRole(session, allowedRoles)) {
    redirect(getRoleDashboardPath(session.primaryRole));
  }

  return session;
}
