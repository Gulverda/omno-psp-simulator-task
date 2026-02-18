import type { FastifyPluginAsync } from "fastify";

export const pspRoutes: FastifyPluginAsync = async (app) => {
  app.post("/transactions", async () => {
    return { message: "Not implemented yet" };
  });

  app.get("/3ds/:txId", async () => {
    return { message: "Not implemented yet" };
  });
};
