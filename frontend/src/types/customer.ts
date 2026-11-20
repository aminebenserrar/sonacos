export type CartItem = {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  productReference: string;
  categoryName: string;
  unit: string;
  imageUrl: string;
  quantity: number;
  availableStock: number;
  unitPrice: number;
  subtotal: number;
};

export type Cart = {
  id: number;
  clientId: number;
  itemsCount: number;
  totalAmount: number;
  items: CartItem[];
};

export type ReceptionMode = "LIVRAISON" | "RETRAIT_CENTRE";
export type PaymentMode = "PAIEMENT_SUR_PLACE" | "VIREMENT" | "CARTE_SIMULEE";
export type OrderStatus =
  | "EN_ATTENTE"
  | "CONFIRMEE"
  | "EN_PREPARATION"
  | "PRETE"
  | "EXPEDIEE"
  | "LIVREE"
  | "ANNULEE"
  | "REFUSEE";
export type PaymentStatus = "EN_ATTENTE" | "VALIDE" | "REFUSE" | "REMBOURSE";

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type CustomerOrder = {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  receptionMode: ReceptionMode;
  deliveryAddress: string | null;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus | null;
  comment: string | null;
  createdAt: string;
  items: OrderItem[];
  invoiceId: number | null;
  invoiceNumber: string | null;
  invoicePdfPath: string | null;
};

export type CustomerInvoice = {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  amountExcludingTax: number;
  taxAmount: number;
  totalAmount: number;
  pdfPath: string;
  generatedAt: string;
};
