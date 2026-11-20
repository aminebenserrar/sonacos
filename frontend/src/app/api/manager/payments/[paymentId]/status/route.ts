import { NextRequest, NextResponse } from "next/server";
import { updateManagerPaymentStatus } from "@/lib/api/manager";
import {
  requireManagerAccess,
  toManagerApiErrorResponse,
} from "@/app/api/manager/_helpers";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const { paymentId } = await context.params;
    const payment = await updateManagerPaymentStatus(
      access.token,
      Number(paymentId),
      payload.status,
    );
    return NextResponse.json(payment);
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
