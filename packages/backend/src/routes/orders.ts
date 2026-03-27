import type { FastifyInstance } from "fastify";

export const orderRoutes = async (app: FastifyInstance) => {
  app.post("/orders", async (_request, reply) => {
    return reply.status(501).send({ message: "Még nem implementált" });
  });

  app.get("/orders/:id", async (_request, reply) => {
    return reply.status(501).send({ message: "Még nem implementált" });
  });
};
