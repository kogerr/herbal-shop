import { z } from "zod";

const HUNGARIAN_ZIP = /^[0-9]{4}$/;
const PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

export const shippingInfoSchema = z.object({
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  zip: z.string().regex(HUNGARIAN_ZIP, "Érvénytelen irányítószám"),
});

export const billingInfoSchema = shippingInfoSchema.extend({
  taxNumber: z.string().optional(),
});

export const createOrderSchema = z.object({
  billing: billingInfoSchema,
  customerEmail: z.string().email("Érvénytelen e-mail cím"),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().regex(PHONE_REGEX, "Érvénytelen telefonszám"),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
  note: z.string().max(500).optional(),
  shipping: shippingInfoSchema,
});
