import { NextRequest, NextResponse } from "next/server";
import { createOrder, getMyOrders } from "@/lib/api/customer";
import {
  requireCustomerAccess,
  toApiErrorResponse,
} from "@/app/api/customer/_helpers";

export async function GET() {
  const access = await requireCustomerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const orders = await getMyOrders(access.token);
    return NextResponse.json(orders);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const access = await requireCustomerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const order = await createOrder(access.token, payload);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
