import { asc } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { categories } from "../db/schema.js";

export const categoryRoutes = async (app: FastifyInstance) => {
  app.get("/categories", async () => {
    const result = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    return result;
  });
};
