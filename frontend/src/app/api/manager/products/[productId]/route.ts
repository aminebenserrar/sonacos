import { NextRequest, NextResponse } from "next/server";
import { updateManagerProduct } from "@/lib/api/manager";
import {
  requireManagerAccess,
  toManagerApiErrorResponse,
} from "@/app/api/manager/_helpers";

type Params = {
  params: Promise<{ productId: string }>;
};

export async function PUT(request: NextRequest, context: Params) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const { productId } = await context.params;
    const payload = await request.json();
    const product = await updateManagerProduct(
      access.token,
      Number(productId),
      payload,
    );
    return NextResponse.json(product);
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
