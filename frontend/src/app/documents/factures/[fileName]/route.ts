import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { getOptionalSession, getSessionToken } from "@/lib/auth/guards";
import type { ArchiveDocument } from "@/types/archive";
import type { CustomerInvoice } from "@/types/customer";

type RouteContext = {
  params: Promise<{
    fileName: string;
  }>;
};

function matchesFileName(fileName: string, pdfPath: string, documentNumber: string) {
  return (
    pdfPath.endsWith(`/${fileName}`) ||
    `${documentNumber}.pdf`.toLowerCase() === fileName.toLowerCase()
  );
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  const token = await getSessionToken();

  if (!session || !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { fileName } = await context.params;

  try {
    if (session.roles.includes("ARCHIVISTE")) {
      const response = await fetch(`${getApiBaseUrl()}/archiviste/documents`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/archiviste/documents", request.url));
      }

      const documents = (await response.json()) as ArchiveDocument[];
      const document = documents.find((item) =>
        matchesFileName(fileName, item.pdfPath, item.documentNumber),
      );

      if (document) {
        return NextResponse.redirect(
          new URL(`/api/archiviste/documents/${document.id}/download`, request.url),
        );
      }
    }

    if (session.roles.includes("CLIENT")) {
      const response = await fetch(`${getApiBaseUrl()}/customer/invoices`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/espace-client/factures", request.url));
      }

      const invoices = (await response.json()) as CustomerInvoice[];
      const invoice = invoices.find((item) =>
        matchesFileName(fileName, item.pdfPath, item.invoiceNumber),
      );

      if (invoice) {
        return NextResponse.redirect(
          new URL(`/api/customer/invoices/${invoice.id}/download`, request.url),
        );
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}
