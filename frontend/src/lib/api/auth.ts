import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UserProfile,
} from "@/types/auth";
import { apiRequest } from "@/lib/api/http";

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getMyProfile(token: string) {
  return apiRequest<UserProfile>("/auth/me", {
    token,
  });
}

export function updateMyProfile(token: string, payload: UpdateProfilePayload) {
  return apiRequest<UserProfile>("/auth/profile", {
    token,
    method: "PUT",
    body: payload,
  });
}

export function changeMyPassword(token: string, payload: ChangePasswordPayload) {
  return apiRequest<void>("/auth/change-password", {
    token,
    method: "PUT",
    body: payload,
  });
}
