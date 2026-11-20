import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  requireArchivisteAccess,
  toArchivisteApiErrorResponse,
} from "@/app/api/archiviste/_helpers";

type RouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const access = await requireArchivisteAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const { invoiceId } = await context.params;
    const response = await fetch(
      `${getApiBaseUrl()}/archiviste/documents/${invoiceId}/download`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${access.token}`,
          Accept: "application/pdf",
        },
      },
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : { message: "Le telechargement du document a echoue." };

      return NextResponse.json(payload, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/pdf",
        "Content-Disposition":
          response.headers.get("content-disposition") ??
          `attachment; filename="facture-${invoiceId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toArchivisteApiErrorResponse(error);
  }
}
