import { and, eq, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { categories, products } from "../db/schema.js";

export const productRoutes = async (app: FastifyInstance) => {
  app.get("/products", async (request) => {
    const { category, limit = "20", page = "1" } = request.query as {
      category?: string;
      limit?: string;
      page?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let whereCondition = eq(products.isActive, true);

    if (category) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category))
        .limit(1);

      if (cat) {
        whereCondition = and(eq(products.isActive, true), eq(products.categoryId, cat.id))!;
      }
    }

    const [productRows, [countRow]] = await Promise.all([
      db.select().from(products).where(whereCondition).limit(limitNum).offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(products).where(whereCondition),
    ]);

    const total = countRow?.total ?? 0;

    return {
      page: pageNum,
      products: productRows,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
  });

  app.get("/products/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const result = await db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: {
        category: true,
      },
    });

    if (!result) {
      return reply.status(404).send({ error: "A termék nem található" });
    }

    return result;
  });
};
