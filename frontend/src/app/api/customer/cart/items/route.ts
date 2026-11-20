import { NextRequest, NextResponse } from "next/server";
import { addCartItem } from "@/lib/api/customer";
import {
  requireCustomerAccess,
  toApiErrorResponse,
} from "@/app/api/customer/_helpers";

export async function POST(request: NextRequest) {
  const access = await requireCustomerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const cart = await addCartItem(
      access.token,
      payload.productId,
      payload.quantity,
    );
    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
