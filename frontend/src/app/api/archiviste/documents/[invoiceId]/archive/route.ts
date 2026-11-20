import { NextResponse } from "next/server";
import { archiveArchivisteDocument } from "@/lib/api/archiviste";
import {
  requireArchivisteAccess,
  toArchivisteApiErrorResponse,
} from "@/app/api/archiviste/_helpers";

type RouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  const access = await requireArchivisteAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const { invoiceId } = await context.params;
    const document = await archiveArchivisteDocument(
      access.token,
      Number(invoiceId),
    );
    return NextResponse.json(document);
  } catch (error) {
    return toArchivisteApiErrorResponse(error);
  }
}
