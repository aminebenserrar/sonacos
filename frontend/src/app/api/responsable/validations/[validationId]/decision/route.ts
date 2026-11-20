import { NextRequest, NextResponse } from "next/server";
import { decideResponsableValidation } from "@/lib/api/validation";
import {
  requireResponsableAccess,
  toResponsableApiErrorResponse,
} from "@/app/api/responsable/_helpers";

type RouteContext = {
  params: Promise<{
    validationId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireResponsableAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await request.json();
    const { validationId } = await context.params;
    const decision = await decideResponsableValidation(
      access.token,
      Number(validationId),
      payload.status,
      payload.rejectionReason,
    );
    return NextResponse.json(decision);
  } catch (error) {
    return toResponsableApiErrorResponse(error);
  }
}
