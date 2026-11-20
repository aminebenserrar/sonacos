import { apiRequest } from "@/lib/api/http";
import type { AuditLogPage } from "@/types/audit";

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  active: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export async function getAdminRoles(token: string) {
  return apiRequest<string[]>("/admin/roles", { token });
}

export async function getAdminUsers(token: string) {
  return apiRequest<AdminUser[]>("/admin/users", { token });
}

export async function createAdminUser(
  token: string,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    active: boolean;
    password: string;
    roles: string[];
  },
) {
  return apiRequest<AdminUser>("/admin/users", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateAdminUser(
  token: string,
  userId: number,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    active: boolean;
    password?: string | null;
  },
) {
  return apiRequest<AdminUser>(`/admin/users/${userId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function updateAdminUserStatus(
  token: string,
  userId: number,
  active: boolean,
) {
  return apiRequest<AdminUser>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    token,
    body: {
      active,
    },
  });
}

export async function updateAdminUserRoles(
  token: string,
  userId: number,
  roles: string[],
) {
  return apiRequest<AdminUser>(`/admin/users/${userId}/roles`, {
    method: "PATCH",
    token,
    body: {
      roles,
    },
  });
}

export function getAdminActivity(
  token: string,
  query: Record<string, string | number | undefined | null>,
) {
  return apiRequest<AuditLogPage>("/admin/activity", { token, query });
}

export function getAdminActivityEntry(token: string, activityId: number) {
  return apiRequest<AuditLogPage["content"][number]>(`/admin/activity/${activityId}`, {
    token,
  });
}
