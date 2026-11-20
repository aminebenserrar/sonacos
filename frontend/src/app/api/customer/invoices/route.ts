import { NextResponse } from "next/server";
import { getMyInvoices } from "@/lib/api/customer";
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
    const invoices = await getMyInvoices(access.token);
    return NextResponse.json(invoices);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
