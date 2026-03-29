import { and, count, desc, eq, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { orders, products } from "../db/schema.js";
import { adminAuth } from "../middleware/adminAuth.js";

export const adminRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", adminAuth);

  app.get("/products", async () => {
    const result = await db.select().from(products);
    return result;
  });

  app.post("/products", async (request, reply) => {
    const body = request.body as typeof products.$inferInsert;
    const [insertedProduct] = await db.insert(products).values(body).returning();
    return reply.status(201).send(insertedProduct);
  });

  app.put("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<typeof products.$inferInsert>;
    const [updatedProduct] = await db
      .update(products)
      .set(body)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return reply.status(404).send({ error: "A termék nem található" });
    }

    return updatedProduct;
  });

  app.delete("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "A termék nem található" });
    }

    return result[0];
  });

  app.get("/orders", async (request) => {
    const query = request.query as {
      limit?: number | string;
      page?: number | string;
      status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    };

    const pageValue = typeof query.page === "string" ? Number.parseInt(query.page, 10) : query.page;
    const limitValue = typeof query.limit === "string" ? Number.parseInt(query.limit, 10) : query.limit;
    const page = Number.isFinite(pageValue) && pageValue && pageValue > 0 ? pageValue : 1;
    const limit = Number.isFinite(limitValue) && limitValue && limitValue > 0 ? limitValue : 10;
    const offset = (page - 1) * limit;

    const whereCondition = query.status ? eq(orders.status, query.status) : undefined;

    const ordersResult = await db
      .select({
        createdAt: orders.createdAt,
        customerEmail: orders.customerEmail,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalHuf: orders.totalHuf,
      })
      .from(orders)
      .where(whereCondition)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({
        total: count(),
      })
      .from(orders)
      .where(whereCondition);
    const total = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      orders: ordersResult,
      page,
      total,
      totalPages,
    };
  });

  app.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: true,
      },
    });

    if (!result) {
      return reply.status(404).send({ error: "A rendelés nem található" });
    }

    return {
      ...result,
      orderItems: result.orderItems.map((item) => ({
        id: item.id,
        lineTotalHuf: item.lineTotalHuf,
        productName: item.productName,
        productPriceHuf: item.productPriceHuf,
        quantity: item.quantity,
      })),
    };
  });

  app.patch("/orders/:id/ship", async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .update(orders)
      .set({
        status: "shipped",
        updatedAt: sql`now()`,
      })
      .where(and(eq(orders.id, id), eq(orders.status, "paid")))
      .returning();

    if (result.length === 0) {
      const existingOrder = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, id)).limit(1);
      if (existingOrder.length === 0) {
        return reply.status(404).send({ error: "A rendelés nem található" });
      }

      return reply.status(400).send({ error: "Csak kifizetett rendelés szállítható" });
    }

    return result[0];
  });
};
