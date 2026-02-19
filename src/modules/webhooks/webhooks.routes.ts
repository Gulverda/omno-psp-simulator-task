import type { FastifyPluginAsync } from "fastify";
import { webhooksController } from "./webhooks.controller.js";

export const webhooksRoutes: FastifyPluginAsync = async (app) => {
  const controller = webhooksController(app);

  app.post(
    "/psp",
    {
      schema: {
        tags: ["webhooks"],
        summary: "Receive PSP webhook",
        body: {
          type: "object",
          required: ["transactionId", "status", "final_amount"],
          properties: {
            transactionId: { type: "string" },
            status: {
              type: "string",
              enum: ["SUCCESS", "FAILED", "3DS_REQUIRED"],
            },
            final_amount: { type: "integer" },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
              ignored: { type: "boolean" },
            },
          },
        },
      },
    },
    controller.handlePspWebhook,
  );
};
