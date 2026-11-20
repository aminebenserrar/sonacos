import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/api/auth";
import { isApiClientError } from "@/lib/api/http";
import {
  getPrimaryRole,
  getRoleDashboardPath,
  setAuthCookies,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const auth = await register(payload);
    const response = NextResponse.json(
      {
        user: auth.user,
        redirectPath: getRoleDashboardPath(getPrimaryRole(auth.user.roles)),
      },
      { status: 201 },
    );
    const sessionUser = setAuthCookies(response, auth);
    response.headers.set(
      "x-sonacos-redirect",
      getRoleDashboardPath(sessionUser.primaryRole),
    );
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
