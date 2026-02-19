import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { webhooksService } from "./webhooks.service.js";

type PspWebhookBody = {
  transactionId: string;
  final_amount: number;
  status: "SUCCESS" | "FAILED" | "3DS_REQUIRED";
};

export function webhooksController(app: FastifyInstance) {
  const service = webhooksService(app);

  return {
    handlePspWebhook: async (
      req: FastifyRequest<{ Body: PspWebhookBody }>,
      reply: FastifyReply,
    ) => {
      const result = await service.processPspWebhook(req.body);
      return reply.code(200).send(result);
    },
  };
}
