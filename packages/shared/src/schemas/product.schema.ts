import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  description: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  ingredients: z.string().min(1),
  isActive: z.boolean().default(true),
  name: z.string().min(1).max(200),
  priceHuf: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "A slug csak kisbetűket, számokat és kötőjelet tartalmazhat"),
  stock: z.number().int().min(0),
  weight: z.number().int().positive(),
});

export const updateProductSchema = createProductSchema.partial();
