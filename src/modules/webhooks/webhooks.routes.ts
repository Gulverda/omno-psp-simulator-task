import type { FastifyPluginAsync } from "fastify";

export const webhooksRoutes: FastifyPluginAsync = async (app) => {
  app.post("/psp", async () => {
    return { message: "Not implemented yet" };
  });
};
