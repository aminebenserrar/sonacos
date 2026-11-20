import { NextRequest, NextResponse } from "next/server";
import { createManagerStockMovement } from "@/lib/api/manager";
import {
  requireManagerAccess,
  toManagerApiErrorResponse,
} from "@/app/api/manager/_helpers";

export async function POST(request: NextRequest) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const movement = await createManagerStockMovement(access.token, payload);
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
