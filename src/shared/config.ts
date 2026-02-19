export const config = {
  server: {
    baseUrl: process.env.BASE_URL ?? "http://127.0.0.1:3000",
  },
  psp: {
    transactionEndpoint: "/psp/transactions",
    webhookEndpoint: "/webhooks/psp",
    failureEndpoint: "/failure/psp",
  },
};
