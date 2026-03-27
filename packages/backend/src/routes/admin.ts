import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { adminAuth } from "../middleware/adminAuth.js";

export const adminRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", adminAuth);

  app.get("/products", async () => {
    const result = await db.select().from(products);
    return result;
  });

  app.post("/products", async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const result = await db.insert(products).values(body as typeof products.$inferInsert).returning();
    return reply.status(201).send(result[0]);
  });

  app.put("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const result = await db
      .update(products)
      .set(body as Partial<typeof products.$inferInsert>)
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) {
      return reply.status(404).send({ error: "A termék nem található" });
    }

    return result[0];
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
};
