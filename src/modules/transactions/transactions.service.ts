import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { postJson } from "../../shared/http.js";
import {
  assertTransition,
  type TransactionStatus,
} from "./transactions.domain.js";
import { transactionsRepo } from "./transactions.repo.js";

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

      // 1) persist initial
      await repo.create({
        id,
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
      });

      // 2) call PSP simulator (same app)
      const pspPayload = {
        amount: input.amount,
        currency: input.currency,
        cardNumber: input.cardNumber,
        cardExpiry: input.cardExpiry,
        cvv: input.cvv,
        orderId: input.orderId,
        callbackUrl: "http://127.0.0.1:3000/webhooks/psp",
        failureUrl: "http://127.0.0.1:3000/failure/psp",
      };

      const pspRes = await postJson<PspResponse>(
        "http://127.0.0.1:3000/psp/transactions",
        pspPayload,
      );

      // 3) state transition
      const nextStatus = mapPspToInternalStatus(pspRes.status);
      assertTransition("CREATED", nextStatus);

      // 4) store psp id + status
      await repo.attachPspIdAndStatus({
        id,
        pspTransactionId: pspRes.transactionId,
        nextStatus,
      });

      // 5) return response
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
