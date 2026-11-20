import { NextRequest, NextResponse } from "next/server";
import { updateManagerProductStatus } from "@/lib/api/manager";
import {
  requireManagerAccess,
  toManagerApiErrorResponse,
} from "@/app/api/manager/_helpers";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const { productId } = await context.params;
    const product = await updateManagerProductStatus(
      access.token,
      Number(productId),
      payload.active,
      payload.featured,
    );
    return NextResponse.json(product);
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
