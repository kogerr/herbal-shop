import { and, gte, lt, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { orders } from "../db/schema.js";

export const generateOrderNumber = async (): Promise<string> => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(gte(orders.createdAt, dayStart), lt(orders.createdAt, dayEnd)));

  const sequence = (result?.count ?? 0) + 1;
  return `HO-${dateStr}-${String(sequence).padStart(3, "0")}`;
};
