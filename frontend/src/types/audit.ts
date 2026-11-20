import type { PageResponse } from "@/types/api";

export type AuditLogEntry = {
  id: number;
  actionType: string;
  objectType: string;
  objectIdentifier: string;
  description: string;
  performedByFullName: string;
  performedByEmail: string;
  performedByRole: string;
  level: string;
  createdAt: string;
  oldValue: string | null;
  newValue: string | null;
};

export type AuditModuleCount = {
  module: string;
  count: number;
};

export type AuditLogPage = PageResponse<AuditLogEntry>;

export type AuditDashboard = {
  operationsToday: number;
  sensitiveOperationsToday: number;
  anomaliesToday: number;
  activeUsersToday: number;
  recentOperations: AuditLogEntry[];
  moduleBreakdown: AuditModuleCount[];
};
