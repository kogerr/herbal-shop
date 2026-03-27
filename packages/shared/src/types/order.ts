export type BillingInfo = ShippingInfo & {
  taxNumber?: string;
};

export type CreateOrderInput = {
  billing: BillingInfo;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  note?: string;
  shipping: ShippingInfo;
};

export type InvoiceStatus = "pending" | "created" | "failed";

export type OrderItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type OrderSummary = {
  createdAt: string;
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalHuf: number;
};

export type PaymentStatus = "initiated" | "succeeded" | "failed" | "refunded";

export type ShippingInfo = {
  address: string;
  city: string;
  name: string;
  zip: string;
};
