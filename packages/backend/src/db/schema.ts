import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description"),
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  images: text("images").array().default([]).notNull(),
  ingredients: text("ingredients").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  name: text("name").notNull(),
  priceHuf: integer("price_huf").notNull(),
  slug: text("slug").unique().notNull(),
  stock: integer("stock").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  weight: integer("weight").notNull(),
});

export const orders = pgTable("orders", {
  accessToken: text("access_token").notNull(),
  billingAddress: text("billing_address").notNull(),
  billingCity: text("billing_city").notNull(),
  billingName: text("billing_name").notNull(),
  billingTaxNumber: text("billing_tax_number"),
  billingZip: text("billing_zip").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  note: text("note"),
  orderNumber: text("order_number").unique().notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingCostHuf: integer("shipping_cost_huf").default(0).notNull(),
  shippingName: text("shipping_name").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  status: text("status").default("pending").notNull(),
  subtotalHuf: integer("subtotal_huf").notNull(),
  totalHuf: integer("total_huf").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  lineTotalHuf: integer("line_total_huf").notNull(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  productPriceHuf: integer("product_price_huf").notNull(),
  quantity: integer("quantity").notNull(),
});

export const payments = pgTable("payments", {
  amountHuf: integer("amount_huf").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  provider: text("provider").notNull(),
  providerPayload: jsonb("provider_payload"),
  providerTransactionId: text("provider_transaction_id"),
  status: text("status").default("initiated").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: text("invoice_number"),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  pdfData: text("pdf_data"),
  retryCount: integer("retry_count").default(0).notNull(),
  status: text("status").default("pending").notNull(),
  szamlazzInvoiceId: text("szamlazz_invoice_id"),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  invoices: many(invoices),
  orderItems: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
}));
