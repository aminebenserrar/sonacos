import { apiRequest } from "@/lib/api/http";
import type {
  Cart,
  CustomerInvoice,
  CustomerOrder,
  PaymentMode,
  ReceptionMode,
} from "@/types/customer";

export type CreateOrderPayload = {
  receptionMode: ReceptionMode;
  deliveryAddress?: string;
  paymentMode: PaymentMode;
  comment?: string;
};

export function getMyCart(token: string) {
  return apiRequest<Cart>("/customer/cart", { token });
}

export function getMyOrders(token: string) {
  return apiRequest<CustomerOrder[]>("/customer/orders", { token });
}

export function getMyInvoices(token: string) {
  return apiRequest<CustomerInvoice[]>("/customer/invoices", { token });
}

export function addCartItem(token: string, productId: number, quantity: number) {
  return apiRequest<Cart>("/customer/cart/items", {
    method: "POST",
    token,
    body: {
      productId,
      quantity,
    },
  });
}

export function updateCartItem(token: string, itemId: number, quantity: number) {
  return apiRequest<Cart>(`/customer/cart/items/${itemId}`, {
    method: "PUT",
    token,
    body: {
      quantity,
    },
  });
}

export function removeCartItem(token: string, itemId: number) {
  return apiRequest<Cart>(`/customer/cart/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export function createOrder(token: string, payload: CreateOrderPayload) {
  return apiRequest<CustomerOrder>("/customer/orders", {
    method: "POST",
    token,
    body: payload,
  });
}
