import { NextRequest, NextResponse } from "next/server";
import { updateManagerOrderStatus } from "@/lib/api/manager";
import {
  requireManagerAccess,
  toManagerApiErrorResponse,
} from "@/app/api/manager/_helpers";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const { orderId } = await context.params;
    const order = await updateManagerOrderStatus(
      access.token,
      Number(orderId),
      payload.status,
    );
    return NextResponse.json(order);
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
