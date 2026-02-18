import type { FastifyPluginAsync } from "fastify";
import { PspSimulatorService } from "./psp.service.js";
import type { PspCreateTransactionRequest } from "./psp.schemas.js";

export const pspRoutes: FastifyPluginAsync = async (app) => {
  const psp = new PspSimulatorService();

  app.post(
    "/transactions",
    {
      schema: {
        tags: ["psp"],
        summary: "PSP simulator transaction create",
        body: {
          type: "object",
          required: [
            "amount",
            "currency",
            "cardNumber",
            "cardExpiry",
            "cvv",
            "orderId",
            "callbackUrl",
            "failureUrl",
          ],
          properties: {
            amount: { type: "integer", minimum: 1 },
            currency: { type: "string", minLength: 3, maxLength: 3 },
            cardNumber: { type: "string" },
            cardExpiry: { type: "string" },
            cvv: { type: "string" },
            orderId: { type: "string" },
            callbackUrl: { type: "string" },
            failureUrl: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    async (req) => {
      return psp.createTransaction(req.body as PspCreateTransactionRequest);
    },
  );

  app.get(
    "/3ds/:txId",
    {
      schema: {
        tags: ["psp"],
        summary: "Simulated 3DS page",
        params: {
          type: "object",
          required: ["txId"],
          properties: { txId: { type: "string" } },
        },
        querystring: {
          type: "object",
          properties: { result: { type: "string" } },
        },
      },
    },
    async (req, reply) => {
      const { txId } = req.params as { txId: string };
      const result =
        (req.query as any)?.result === "failed" ? "failed" : "success";

      const out = await psp.complete3ds(txId, result);

      if (!out.found)
        return reply.code(404).send({ message: "Transaction not found" });

      reply.type("text/html").send(`
        <html>
          <body style="font-family: Arial; padding: 24px;">
            <h2>3DS Simulation</h2>
            <p>Transaction: <b>${txId}</b></p>
            <p>Result chosen: <b>${result}</b></p>
            <p>Webhook will be sent shortly.</p>
            <hr/>
            <a href="/psp/3ds/${txId}?result=success">Simulate SUCCESS</a><br/>
            <a href="/psp/3ds/${txId}?result=failed">Simulate FAILED</a>
          </body>
        </html>
      `);
    },
  );
};
