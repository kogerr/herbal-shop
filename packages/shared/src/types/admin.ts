import type { OrderStatus } from "./order.js";

export type AdminOrderItem = {
  id: string;
  lineTotalHuf: number;
  productName: string;
  productPriceHuf: number;
  quantity: number;
};

export type AdminOrderDetail = {
  accessToken: string;
  billingAddress: string;
  billingCity: string;
  billingName: string;
  billingTaxNumber?: string;
  billingZip: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  id: string;
  items: AdminOrderItem[];
  note?: string;
  orderNumber: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCostHuf: number;
  shippingName: string;
  shippingZip: string;
  status: OrderStatus;
  subtotalHuf: number;
  totalHuf: number;
  updatedAt: string;
};

export type AdminOrderSummary = {
  createdAt: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalHuf: number;
};

export type AdminStats = {
  activeProducts: number;
  pendingOrders: number;
  todayRevenue: number;
  totalOrders: number;
};

export type OrderStatusConfig = {
  color: "default" | "error" | "info" | "primary" | "secondary" | "success" | "warning";
  label: string;
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  cancelled: { color: "error", label: "Lemondva" },
  delivered: { color: "success", label: "Kézbesítve" },
  paid: { color: "info", label: "Fizetve" },
  pending: { color: "warning", label: "Függőben" },
  shipped: { color: "primary", label: "Kiszállítva" },
};
