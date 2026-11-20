export type ArchiveDocument = {
  id: number;
  documentType: string;
  documentNumber: string;
  orderNumber: string;
  clientFullName: string;
  totalAmount: number;
  pdfPath: string;
  generatedAt: string;
  archived: boolean;
  archivedAt: string | null;
  archivedByFullName: string | null;
  orderStatus: string;
};
