export type ValidationOperation = {
  id: number;
  operationType: string;
  targetReference: string;
  description: string;
  requesterFullName: string;
  requesterEmail: string | null;
  requesterRole: string;
  responsibleFullName: string;
  status: string;
  priority: string;
  rejectionReason: string | null;
  requestedAt: string;
  decidedAt: string | null;
};
