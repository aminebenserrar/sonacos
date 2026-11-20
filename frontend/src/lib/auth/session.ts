import type { NextResponse } from "next/server";
import type { AuthResponse, RoleCode, SessionUser, UserProfile } from "@/types/auth";

export const AUTH_TOKEN_COOKIE = "sonacos_token";
export const AUTH_USER_COOKIE = "sonacos_user";

const rolePriority: RoleCode[] = [
  "ADMIN",
  "GESTIONNAIRE",
  "RESPONSABLE",
  "ARCHIVISTE",
  "AUDITEUR",
  "CLIENT",
];

export function getPrimaryRole(roles: RoleCode[]) {
  return rolePriority.find((role) => roles.includes(role)) ?? "CLIENT";
}

export function resolveRoleDashboardPath(role?: RoleCode | string | null) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "GESTIONNAIRE":
      return "/gestionnaire";
    case "RESPONSABLE":
      return "/responsable";
    case "ARCHIVISTE":
      return "/archiviste";
    case "AUDITEUR":
      return "/auditeur";
    case "CLIENT":
      return "/espace-client";
    default:
      return null;
  }
}

export function getRoleDashboardPath(role: RoleCode) {
  return resolveRoleDashboardPath(role) ?? "/espace-client";
}

export function getSessionWorkspacePath(user: SessionUser | null) {
  if (!user) {
    return null;
  }

  return resolveRoleDashboardPath(user.primaryRole);
}

export function toSessionUser(user: UserProfile): SessionUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    roles: user.roles,
    primaryRole: getPrimaryRole(user.roles),
  };
}

export function encodeSessionUser(user: SessionUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function decodeSessionUser(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser;
  } catch {
    return null;
  }
}

export function setAuthCookies(response: NextResponse, auth: AuthResponse) {
  const secure = process.env.NODE_ENV === "production";
  const expires = new Date(Date.now() + auth.expiresInMs);
  const sessionUser = toSessionUser(auth.user);

  response.cookies.set(AUTH_TOKEN_COOKIE, auth.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires,
  });

  response.cookies.set(AUTH_USER_COOKIE, encodeSessionUser(sessionUser), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires,
  });

  return sessionUser;
}

export function setSessionUserCookie(
  response: NextResponse,
  user: UserProfile,
  expires = new Date(Date.now() + 86_400_000),
) {
  response.cookies.set(AUTH_USER_COOKIE, encodeSessionUser(toSessionUser(user)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set(AUTH_USER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export function hasRequiredRole(
  user: SessionUser | null,
  allowedRoles?: RoleCode[],
) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!user) {
    return false;
  }

  return user.roles.some((role) => allowedRoles.includes(role));
}
