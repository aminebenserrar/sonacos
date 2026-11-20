import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RoleCode, SessionUser } from "@/types/auth";
import {
  AUTH_TOKEN_COOKIE,
  AUTH_USER_COOKIE,
  decodeSessionUser,
  hasRequiredRole,
} from "@/lib/auth/session";

type ProtectedApiContext =
  | {
      ok: true;
      token: string;
      session: SessionUser;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireApiAccess(
  allowedRoles: RoleCode[],
): Promise<ProtectedApiContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
  const session = decodeSessionUser(cookieStore.get(AUTH_USER_COOKIE)?.value);

  if (!token || !session) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Authentification requise" },
        { status: 401 },
      ),
    };
  }

  if (!hasRequiredRole(session, allowedRoles)) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Acces non autorise" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    token,
    session,
  };
}
