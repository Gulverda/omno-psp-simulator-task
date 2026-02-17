import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type CreateTransactionBody = {
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  orderId: string;
};

export function transactionsController(app: FastifyInstance) {
  return {
    create: async (
      req: FastifyRequest<{ Body: CreateTransactionBody }>,
      reply: FastifyReply,
    ) => {
      return reply.code(501).send({ message: "Not implemented yet" });
    },
  };
}
