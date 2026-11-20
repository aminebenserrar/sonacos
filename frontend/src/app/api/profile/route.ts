import { NextRequest, NextResponse } from "next/server";
import { requireApiAccess } from "@/app/api/_helpers/role-access";
import { getMyProfile, updateMyProfile } from "@/lib/api/auth";
import { isApiClientError } from "@/lib/api/http";
import { setSessionUserCookie } from "@/lib/auth/session";

const allowedRoles = [
  "ADMIN",
  "GESTIONNAIRE",
  "RESPONSABLE",
  "ARCHIVISTE",
  "AUDITEUR",
  "CLIENT",
] as const;

export async function GET() {
  const access = await requireApiAccess([...allowedRoles]);
  if (!access.ok) {
    return access.response;
  }

  try {
    const profile = await getMyProfile(access.token);
    const response = NextResponse.json(profile);
    setSessionUserCookie(response, profile);
    return response;
  } catch (error) {
    if (isApiClientError(error)) {
      return NextResponse.json(error.payload ?? { message: error.message }, {
        status: error.status,
      });
    }

    return NextResponse.json(
      { message: "Une erreur interne est survenue" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const access = await requireApiAccess([...allowedRoles]);
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const profile = await updateMyProfile(access.token, payload);
    const response = NextResponse.json(profile);
    setSessionUserCookie(response, profile);
    return response;
  } catch (error) {
    if (isApiClientError(error)) {
      return NextResponse.json(error.payload ?? { message: error.message }, {
        status: error.status,
      });
    }

    return NextResponse.json(
      { message: "Une erreur interne est survenue" },
      { status: 500 },
    );
  }
}
