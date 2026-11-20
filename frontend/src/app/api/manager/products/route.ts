import { NextRequest, NextResponse } from "next/server";
import { createManagerProduct } from "@/lib/api/manager";
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
    const product = await createManagerProduct(access.token, payload);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
