import { NextRequest, NextResponse } from "next/server";
import { requireApiAccess } from "@/app/api/_helpers/role-access";
import { changeMyPassword } from "@/lib/api/auth";
import { isApiClientError } from "@/lib/api/http";

const allowedRoles = [
  "ADMIN",
  "GESTIONNAIRE",
  "RESPONSABLE",
  "ARCHIVISTE",
  "AUDITEUR",
  "CLIENT",
] as const;

export async function PUT(request: NextRequest) {
  const access = await requireApiAccess([...allowedRoles]);
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    await changeMyPassword(access.token, payload);
    return NextResponse.json({ success: true });
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
