import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodSchema } from "zod";

export const createValidator = (schema: ZodSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Érvénytelen adatok",
        details: result.error.flatten().fieldErrors,
      });
    }

    request.body = result.data;
  };
};
