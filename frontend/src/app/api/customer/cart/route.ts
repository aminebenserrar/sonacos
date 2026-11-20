import { NextResponse } from "next/server";
import { getMyCart } from "@/lib/api/customer";
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
    const cart = await getMyCart(access.token);
    return NextResponse.json(cart);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
