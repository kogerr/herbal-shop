import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  ADMIN_API_KEY: z.string().default("dev-admin-key"),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
});

export const config = envSchema.parse(process.env);
