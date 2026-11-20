import { apiRequest } from "@/lib/api/http";
import type { ArchiveDocument } from "@/types/archive";
import type { AuditDashboard, AuditLogPage } from "@/types/audit";
import type { ManagerOrder, PaymentRecord, StockMovementRecord } from "@/types/manager";
import type { ValidationOperation } from "@/types/validation";

export function getAuditeurDashboard(token: string) {
  return apiRequest<AuditDashboard>("/auditeur/dashboard", { token });
}

export function getAuditeurJournal(
  token: string,
  query: Record<string, string | number | undefined | null>,
) {
  return apiRequest<AuditLogPage>("/auditeur/journal", { token, query });
}

export function getAuditeurJournalEntry(token: string, activityId: number) {
  return apiRequest<AuditLogPage["content"][number]>(`/auditeur/journal/${activityId}`, {
    token,
  });
}

export function getAuditeurOrders(token: string) {
  return apiRequest<ManagerOrder[]>("/auditeur/orders", { token });
}

export function getAuditeurPayments(token: string) {
  return apiRequest<PaymentRecord[]>("/auditeur/payments", { token });
}

export function getAuditeurStockMovements(token: string) {
  return apiRequest<StockMovementRecord[]>("/auditeur/stock-movements", { token });
}

export function getAuditeurInvoices(token: string) {
  return apiRequest<ArchiveDocument[]>("/auditeur/invoices", { token });
}

export function getAuditeurValidations(token: string) {
  return apiRequest<ValidationOperation[]>("/auditeur/validations", { token });
}
