import { createOrderSchema, type CreateOrderInput } from "@webshop/shared";
import { eq, inArray, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import { orderItems, orders, products } from "../db/schema.js";
import { createValidator } from "../middleware/validate.js";
import { generateOrderNumber } from "../utils/generateOrderNumber.js";

const FREE_SHIPPING_THRESHOLD = 15_000;
const SHIPPING_COST_HUF = 1_490;

export const orderRoutes = async (app: FastifyInstance) => {
  app.post(
    "/orders",
    { preHandler: createValidator(createOrderSchema) },
    async (request, reply) => {
      const body = request.body as CreateOrderInput;
      const requestedProductIds = Array.from(new Set(body.items.map((item) => item.productId)));
      const productRows = await db
        .select()
        .from(products)
        .where(inArray(products.id, requestedProductIds));
      const productById = new Map(productRows.map((product) => [product.id, product]));
      const requestedQuantityByProductId = new Map<string, number>();

      for (const item of body.items) {
        const currentQuantity = requestedQuantityByProductId.get(item.productId) ?? 0;
        requestedQuantityByProductId.set(item.productId, currentQuantity + item.quantity);
      }

      const validationErrors: Array<Record<string, unknown>> = [];

      for (const [productId, requestedQuantity] of requestedQuantityByProductId.entries()) {
        const product = productById.get(productId);

        if (!product) {
          validationErrors.push({
            error: "A termék nem található",
            productId,
          });
          continue;
        }

        if (!product.isActive) {
          validationErrors.push({
            error: "A termék nem aktív",
            productId,
          });
          continue;
        }

        if (product.stock < requestedQuantity) {
          validationErrors.push({
            availableStock: product.stock,
            error: "Nincs elegendő készlet",
            productId,
            requestedQuantity,
          });
        }
      }

      if (validationErrors.length > 0) {
        return reply.status(400).send({
          details: validationErrors,
          error: "Érvénytelen rendelési tételek",
        });
      }

      const createdOrder = await db.transaction(async (tx) => {
        let subtotalHuf = 0;

        for (const item of body.items) {
          const product = productById.get(item.productId);
          if (!product) {
            throw new Error(`Hiányzó termék: ${item.productId}`);
          }

          subtotalHuf += product.priceHuf * item.quantity;
        }

        const shippingCostHuf = subtotalHuf >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST_HUF;
        const totalHuf = subtotalHuf + shippingCostHuf;
        const orderNumber = await generateOrderNumber();
        const accessToken = crypto.randomUUID();

        const [order] = await tx
          .insert(orders)
          .values({
            accessToken,
            billingAddress: body.billing.address,
            billingCity: body.billing.city,
            billingName: body.billing.name,
            billingTaxNumber: body.billing.taxNumber,
            billingZip: body.billing.zip,
            customerEmail: body.customerEmail,
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            note: body.note,
            orderNumber,
            shippingAddress: body.shipping.address,
            shippingCity: body.shipping.city,
            shippingCostHuf,
            shippingName: body.shipping.name,
            shippingZip: body.shipping.zip,
            status: "pending",
            subtotalHuf,
            totalHuf,
          })
          .returning();

        const orderItemValues = body.items.map((item) => {
          const product = productById.get(item.productId);
          if (!product) {
            throw new Error(`Hiányzó termék: ${item.productId}`);
          }

          const lineTotalHuf = product.priceHuf * item.quantity;
          return {
            lineTotalHuf,
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            productPriceHuf: product.priceHuf,
            quantity: item.quantity,
          };
        });

        await tx.insert(orderItems).values(orderItemValues);

        for (const [productId, quantity] of requestedQuantityByProductId.entries()) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${quantity}` })
            .where(eq(products.id, productId));
        }

        return order;
      });

      return reply.status(201).send({
        accessToken: createdOrder.accessToken,
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
      });
    },
  );

  app.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { token } = request.query as { token?: string };
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: true,
      },
    });

    if (!order) {
      return reply.status(404).send({ error: "A rendelés nem található" });
    }

    if (token !== order.accessToken) {
      return reply.status(403).send({ error: "Érvénytelen hozzáférési token" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, orderItems: items, ...orderData } = order;
    return { ...orderData, items };
  });
};
