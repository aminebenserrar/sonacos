import { NextRequest, NextResponse } from "next/server";
import { createAdminUser } from "@/lib/api/admin";
import {
  requireAdminAccess,
  toAdminApiErrorResponse,
} from "@/app/api/admin/_helpers";

export async function POST(request: NextRequest) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const user = await createAdminUser(access.token, payload);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return toAdminApiErrorResponse(error);
  }
}
