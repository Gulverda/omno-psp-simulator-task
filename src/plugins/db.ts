import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import pg from "pg";

declare module "fastify" {
  interface FastifyInstance {
    db: pg.Pool;
  }
}

const dbPluginImpl: FastifyPluginAsync = async (app) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new pg.Pool({ connectionString });

  app.decorate("db", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });

  app.log.info("DB plugin registered and decorated");
};

export const dbPlugin = fp(dbPluginImpl, { name: "db-plugin" });
