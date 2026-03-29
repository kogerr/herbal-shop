import type { CreateOrderInput, OrderDetail } from "@webshop/shared";
import { apiFetch } from "./client";

type CreateOrderResponse = {
  accessToken: string;
  orderId: string;
  orderNumber: string;
};

export const createOrder = (body: CreateOrderInput): Promise<CreateOrderResponse> => {
  return apiFetch<CreateOrderResponse>("/orders", { body, method: "POST" });
};

export const fetchOrder = (id: string, token: string): Promise<OrderDetail> => {
  return apiFetch<OrderDetail>(`/orders/${id}?token=${encodeURIComponent(token)}`);
};
