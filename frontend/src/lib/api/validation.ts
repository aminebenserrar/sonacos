import { apiRequest } from "@/lib/api/http";
import type { ValidationOperation } from "@/types/validation";

export function getResponsableValidations(token: string) {
  return apiRequest<ValidationOperation[]>("/responsable/validations", { token });
}

export function getResponsableValidation(token: string, validationId: number) {
  return apiRequest<ValidationOperation>(`/responsable/validations/${validationId}`, {
    token,
  });
}

export function decideResponsableValidation(
  token: string,
  validationId: number,
  status: string,
  rejectionReason?: string,
) {
  return apiRequest<ValidationOperation>(
    `/responsable/validations/${validationId}/decision`,
    {
      token,
      method: "PATCH",
      body: { status, rejectionReason },
    },
  );
}
