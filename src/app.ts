import Fastify from "fastify";
import sensible from "@fastify/sensible";

import { swaggerPlugin } from "./plugins/swagger.js";
import { dbPlugin } from "./plugins/db.js";

import { transactionsRoutes } from "./modules/transactions/transactions.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(sensible);
  await app.register(swaggerPlugin);
  await app.register(dbPlugin);

  await app.register(transactionsRoutes, { prefix: "/transactions" });

  app.get("/health", async () => ({ ok: true }));

  return app;
}
