import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  ADMIN_API_KEY: z.string().default("dev-admin-key"),
  BARION_HOST: z.string().default("api.test.barion.com"),
  BARION_PAYEE: z.string().email(),
  BARION_POS_KEY: z.string(),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  RESEND_API_KEY: z.string().default(""),
  SZAMLAZZ_AGENT_KEY: z.string(),
});

export const config = envSchema.parse(process.env);
