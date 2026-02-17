import type { FastifyPluginAsync } from "fastify";
import pg from "pg";

declare module "fastify" {
  interface FastifyInstance {
    db: pg.Pool;
  }
}

export const dbPlugin: FastifyPluginAsync = async (app) => {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/omno";

  const pool = new pg.Pool({ connectionString });

  app.decorate("db", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });
};
