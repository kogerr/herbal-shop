import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastify from "fastify";
import { config } from "./config.js";
import { adminRoutes } from "./routes/admin.js";
import { orderRoutes } from "./routes/orders.js";
import { productRoutes } from "./routes/products.js";

const buildApp = async () => {
  const app = fastify({
    logger: {
      transport: config.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
    },
  });

  await app.register(cors, { origin: config.FRONTEND_URL });
  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  app.get("/api/health", async () => ({ status: "ok" }));

  await app.register(productRoutes, { prefix: "/api" });
  await app.register(orderRoutes, { prefix: "/api" });
  await app.register(adminRoutes, { prefix: "/api/admin" });

  return app;
};

const start = async () => {
  const app = await buildApp();
  try {
    await app.listen({ host: "0.0.0.0", port: config.PORT });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

if (!process.env.VITEST) {
  start();
}

export { buildApp };
