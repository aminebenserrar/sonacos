export type RoleCode =
  | "ADMIN"
  | "GESTIONNAIRE"
  | "RESPONSABLE"
  | "ARCHIVISTE"
  | "AUDITEUR"
  | "CLIENT";

export type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  active: boolean;
  roles: RoleCode[];
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserProfile;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  password: string;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type SessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  roles: RoleCode[];
  primaryRole: RoleCode;
};
