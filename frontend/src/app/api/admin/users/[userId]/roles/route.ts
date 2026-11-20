import { NextRequest, NextResponse } from "next/server";
import { updateAdminUserRoles } from "@/lib/api/admin";
import {
  requireAdminAccess,
  toAdminApiErrorResponse,
} from "@/app/api/admin/_helpers";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const { userId } = await context.params;
    const user = await updateAdminUserRoles(
      access.token,
      Number(userId),
      payload.roles,
    );
    return NextResponse.json(user);
  } catch (error) {
    return toAdminApiErrorResponse(error);
  }
}
