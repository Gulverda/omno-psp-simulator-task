import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { postJson } from "../../shared/http.js";
import {
  assertTransition,
  type TransactionStatus,
} from "./transactions.domain.js";
import { transactionsRepo } from "./transactions.repo.js";
import { config } from "../../shared/config.js";

type CreateTransactionInput = {
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  orderId: string;
};

type ServiceResult = {
  id: string;
  status: TransactionStatus;
  pspTransactionId: string;
  threeDsRedirectUrl?: string;
};

type PspResponse =
  | { transactionId: string; status: "PENDING_3DS"; threeDsRedirectUrl: string }
  | { transactionId: string; status: "SUCCESS" | "FAILED" };

function mapPspToInternalStatus(psp: PspResponse["status"]): TransactionStatus {
  if (psp === "PENDING_3DS") return "PENDING_3DS";
  if (psp === "SUCCESS") return "SUCCESS";
  return "FAILED";
}

export function transactionsService(app: FastifyInstance) {
  const repo = transactionsRepo(app);

  return {
    async create(input: CreateTransactionInput): Promise<ServiceResult> {
      const id = randomUUID();

      await repo.create({
        id,
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
      });

      const pspPayload = {
        amount: input.amount,
        currency: input.currency,
        cardNumber: input.cardNumber,
        cardExpiry: input.cardExpiry,
        cvv: input.cvv,
        orderId: input.orderId,
        callbackUrl: `${config.server.baseUrl}${config.psp.webhookEndpoint}`,
        failureUrl: `${config.server.baseUrl}${config.psp.failureEndpoint}`,
      };

      const pspRes = await postJson<PspResponse>(
        `${config.server.baseUrl}${config.psp.transactionEndpoint}`,
        pspPayload,
      );

      const nextStatus = mapPspToInternalStatus(pspRes.status);
      assertTransition("CREATED", nextStatus);

      await repo.attachPspIdAndStatus({
        id,
        pspTransactionId: pspRes.transactionId,
        nextStatus,
      });

      if (pspRes.status === "PENDING_3DS") {
        return {
          id,
          status: nextStatus,
          pspTransactionId: pspRes.transactionId,
          threeDsRedirectUrl: pspRes.threeDsRedirectUrl,
        };
      }

      return {
        id,
        status: nextStatus,
        pspTransactionId: pspRes.transactionId,
      };
    },
  };
}
