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
            amount: { type: "integer", minimum: 1, example: 1000 },
            currency: {
              type: "string",
              minLength: 3,
              maxLength: 3,
              example: "EUR",
            },
            cardNumber: { type: "string", example: "4111111111111111" },
            cardExpiry: { type: "string", example: "12/25" },
            cvv: { type: "string", example: "123" },
            orderId: { type: "string", example: "order_123" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "c8d4b4b2-9e3d-4c26-9b8b-0c3b7f7a7d2c",
              },
              status: { type: "string", example: "PENDING_3DS" },
              pspTransactionId: { type: "string", example: "tx_abc123" },
              threeDsRedirectUrl: {
                type: "string",
                example: "http://localhost:3000/psp/3ds/tx_abc123",
              },
            },
          },
        },
      },
    },
    controller.create,
  );
};
