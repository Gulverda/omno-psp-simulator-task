import Fastify from "fastify";
import sensible from "@fastify/sensible";

import { swaggerPlugin } from "./plugins/swagger.js";
import { dbPlugin } from "./plugins/db.js";

import { transactionsRoutes } from "./modules/transactions/transactions.routes.js";
import { pspRoutes } from "./modules/psp/psp.routes.js";
import { webhooksRoutes } from "./modules/webhooks/webhooks.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(sensible);
  await app.register(swaggerPlugin);
  await app.register(dbPlugin);

  await app.register(transactionsRoutes, { prefix: "/transactions" });
  await app.register(pspRoutes, { prefix: "/psp" });
  await app.register(webhooksRoutes, { prefix: "/webhooks" });

  app.get("/health", async () => ({ ok: true }));

  return app;
}
