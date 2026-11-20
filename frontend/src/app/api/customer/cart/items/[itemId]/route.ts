import { NextRequest, NextResponse } from "next/server";
import { removeCartItem, updateCartItem } from "@/lib/api/customer";
import {
  requireCustomerAccess,
  toApiErrorResponse,
} from "@/app/api/customer/_helpers";

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const access = await requireCustomerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const { itemId } = await context.params;
    const cart = await updateCartItem(
      access.token,
      Number(itemId),
      payload.quantity,
    );
    return NextResponse.json(cart);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const access = await requireCustomerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const { itemId } = await context.params;
    const cart = await removeCartItem(access.token, Number(itemId));
    return NextResponse.json(cart);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
