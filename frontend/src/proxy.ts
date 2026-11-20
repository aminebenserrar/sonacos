import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RoleCode } from "@/types/auth";
import {
  AUTH_USER_COOKIE,
  decodeSessionUser,
  getRoleDashboardPath,
  hasRequiredRole,
} from "@/lib/auth/session";

function getRequiredRoles(pathname: string): RoleCode[] | null {
  if (pathname.startsWith("/profil")) {
    return [
      "ADMIN",
      "GESTIONNAIRE",
      "RESPONSABLE",
      "ARCHIVISTE",
      "AUDITEUR",
      "CLIENT",
    ];
  }

  if (pathname.startsWith("/espace-client")) {
    return ["CLIENT"];
  }

  if (pathname.startsWith("/gestionnaire")) {
    return ["GESTIONNAIRE"];
  }

  if (pathname.startsWith("/responsable")) {
    return ["RESPONSABLE"];
  }

  if (pathname.startsWith("/archiviste")) {
    return ["ARCHIVISTE"];
  }

  if (pathname.startsWith("/auditeur")) {
    return ["AUDITEUR"];
  }

  if (pathname.startsWith("/admin")) {
    return ["ADMIN"];
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSessionUser(request.cookies.get(AUTH_USER_COOKIE)?.value);

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(
      new URL(getRoleDashboardPath(session.primaryRole), request.url),
    );
  }

  const requiredRoles = getRequiredRoles(pathname);

  if (!requiredRoles) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!hasRequiredRole(session, requiredRoles)) {
    return NextResponse.redirect(
      new URL(getRoleDashboardPath(session.primaryRole), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/profil/:path*",
    "/espace-client/:path*",
    "/gestionnaire/:path*",
    "/responsable/:path*",
    "/archiviste/:path*",
    "/auditeur/:path*",
    "/admin/:path*",
  ],
};
