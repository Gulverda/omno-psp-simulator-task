import Fastify from "fastify";
import sensible from "@fastify/sensible";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(sensible);

  app.get("/health", async () => ({ ok: true }));

  return app;
}
