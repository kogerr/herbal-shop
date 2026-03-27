import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config.js";

export const adminAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Hiányzó autentikáció" });
  }

  const token = authHeader.slice(7);

  if (token !== config.ADMIN_API_KEY) {
    return reply.status(403).send({ error: "Érvénytelen API kulcs" });
  }
};
