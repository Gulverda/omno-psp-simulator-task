import type { FastifyPluginAsync } from "fastify";
import { transactionsController } from "./transactions.controller.js";

export const transactionsRoutes: FastifyPluginAsync = async (app) => {
  const controller = transactionsController(app);

  app.post(
    "/",
    {
      schema: {
        tags: ["transactions"],
        summary: "Create a transaction",
        description:
          "Creates a transaction and forwards it to the PSP simulator",
        body: {
          type: "object",
          required: [
            "amount",
            "currency",
            "cardNumber",
            "cardExpiry",
            "cvv",
            "orderId",
          ],
          properties: {
            amount: { type: "integer", minimum: 1 },
            currency: { type: "string", minLength: 3, maxLength: 3 },
            cardNumber: { type: "string" },
            cardExpiry: { type: "string" },
            cvv: { type: "string" },
            orderId: { type: "string" },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string" },
              pspTransactionId: { type: "string" },
              threeDsRedirectUrl: { type: "string" },
            },
          },
        },
      },
    },
    controller.create,
  );
};
