import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { transactionsService } from "./transactions.service.js";

type CreateTransactionBody = {
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  orderId: string;
};

export function transactionsController(app: FastifyInstance) {
  const service = transactionsService(app);

  return {
    create: async (
      req: FastifyRequest<{ Body: CreateTransactionBody }>,
      reply: FastifyReply,
    ) => {
      const result = await service.create(req.body);
      return reply.code(200).send(result);
    },
  };
}
