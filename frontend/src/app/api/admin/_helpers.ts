import { NextResponse } from "next/server";
import { requireApiAccess } from "@/app/api/_helpers/role-access";
import { isApiClientError } from "@/lib/api/http";

export async function requireAdminAccess() {
  return requireApiAccess(["ADMIN"]);
}

export function toAdminApiErrorResponse(error: unknown) {
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
