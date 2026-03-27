import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { categories, products } from "../db/schema";

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

    let query = db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .limit(limitNum)
      .offset(offset);

    if (category) {
      const cat = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category))
        .limit(1);

      if (cat[0]) {
        query = db
          .select()
          .from(products)
          .where(and(eq(products.isActive, true), eq(products.categoryId, cat[0].id)))
          .limit(limitNum)
          .offset(offset);
      }
    }

    const result = await query;

    const countResult = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true));

    return {
      page: pageNum,
      products: result,
      total: countResult.length,
      totalPages: Math.ceil(countResult.length / limitNum),
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
