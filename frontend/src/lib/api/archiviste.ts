import { apiRequest } from "@/lib/api/http";
import type { ArchiveDocument } from "@/types/archive";

export function getArchivisteDocuments(token: string) {
  return apiRequest<ArchiveDocument[]>("/archiviste/documents", { token });
}

export function archiveArchivisteDocument(token: string, invoiceId: number) {
  return apiRequest<ArchiveDocument>(`/archiviste/documents/${invoiceId}/archive`, {
    token,
    method: "PATCH",
  });
}
