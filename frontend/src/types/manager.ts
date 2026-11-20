export type ManagerOrder = {
  id: number;
  orderNumber: string;
  clientFullName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
};

export type PaymentRecord = {
  id: number;
  paymentReference: string;
  orderNumber: string;
  clientFullName: string;
  amount: number;
  paymentMode: string;
  status: string;
  paymentDate: string | null;
};

export type StockMovementRecord = {
  id: number;
  productReference: string;
  productName: string;
  movementType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  createdAt: string;
};
