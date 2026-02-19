import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

const swaggerImpl: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "OMNO PSP Integration API",
        description: "Payment integration with local PSP simulator",
        version: "1.0.0",
      },
      servers: [{ url: "/" }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      url: "/docs/json",
    },
  });
};

export const swaggerPlugin = fp(swaggerImpl, { name: "swagger-plugin" });
