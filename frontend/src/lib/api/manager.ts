import { apiRequest } from "@/lib/api/http";
import type {
  ManagerOrder,
  PaymentRecord,
  StockMovementRecord,
} from "@/types/manager";
import type { Product } from "@/types/product";

export function getManagerOrders(token: string) {
  return apiRequest<ManagerOrder[]>("/manager/orders", { token });
}

export function getManagerPayments(token: string) {
  return apiRequest<PaymentRecord[]>("/manager/payments", { token });
}

export function getManagerStockMovements(token: string) {
  return apiRequest<StockMovementRecord[]>("/manager/stock-movements", { token });
}

export function updateManagerOrderStatus(
  token: string,
  orderId: number,
  status: string,
) {
  return apiRequest<ManagerOrder>(`/manager/orders/${orderId}/status`, {
    token,
    method: "PATCH",
    body: { status },
  });
}

export function updateManagerPaymentStatus(
  token: string,
  paymentId: number,
  status: string,
) {
  return apiRequest<PaymentRecord>(`/manager/payments/${paymentId}/status`, {
    token,
    method: "PATCH",
    body: { status },
  });
}

export function createManagerStockMovement(
  token: string,
  payload: {
    productId: number;
    movementType: string;
    quantity: number;
    reason: string;
  },
) {
  return apiRequest<StockMovementRecord>("/manager/stock-movements", {
    token,
    method: "POST",
    body: payload,
  });
}

type BackendProductResponse = {
  id: number;
  slug: string;
  reference: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  unit: string;
  imageUrl: string;
  stockQuantity: number;
  alertThreshold: number;
  active: boolean;
  featured: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

function mapProduct(product: BackendProductResponse): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    reference: product.reference,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    imageUrl: product.imageUrl ?? "",
    price: Number(product.price),
    stockQuantity: product.stockQuantity,
    alertThreshold: product.alertThreshold,
    unit: product.unit,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    active: product.active,
    featured: product.featured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function createManagerProduct(token: string, payload: Record<string, unknown>) {
  return apiRequest<BackendProductResponse>("/products", {
    token,
    method: "POST",
    body: payload,
  }).then(mapProduct);
}

export function updateManagerProduct(
  token: string,
  productId: number,
  payload: Record<string, unknown>,
) {
  return apiRequest<BackendProductResponse>(`/products/${productId}`, {
    token,
    method: "PUT",
    body: payload,
  }).then(mapProduct);
}

export function uploadManagerProductImage(
  token: string,
  productId: number,
  image: File,
) {
  const formData = new FormData();
  formData.append("image", image);

  return apiRequest<BackendProductResponse>(`/products/${productId}/image`, {
    token,
    method: "POST",
    body: formData,
  }).then(mapProduct);
}

export function deleteManagerProductImage(token: string, productId: number) {
  return apiRequest<BackendProductResponse>(`/products/${productId}/image`, {
    token,
    method: "DELETE",
  }).then(mapProduct);
}

export function updateManagerProductStatus(
  token: string,
  productId: number,
  active: boolean,
  featured: boolean,
) {
  return apiRequest<BackendProductResponse>(`/products/${productId}/status`, {
    token,
    method: "PATCH",
    body: { active, featured },
  }).then(mapProduct);
}
