import { NextRequest, NextResponse } from "next/server";
import {
  deleteManagerProductImage,
  uploadManagerProductImage,
} from "@/lib/api/manager";
import {
  requireManagerAccess,
  toManagerApiErrorResponse,
} from "@/app/api/manager/_helpers";

type Params = {
  params: Promise<{ productId: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const { productId } = await context.params;
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { message: "Veuillez selectionner une image produit valide." },
        { status: 400 },
      );
    }

    const product = await uploadManagerProductImage(
      access.token,
      Number(productId),
      image,
    );

    return NextResponse.json(product);
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: Params) {
  const access = await requireManagerAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const { productId } = await context.params;
    const product = await deleteManagerProductImage(
      access.token,
      Number(productId),
    );
    return NextResponse.json(product);
  } catch (error) {
    return toManagerApiErrorResponse(error);
  }
}
