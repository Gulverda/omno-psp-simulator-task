import { randomUUID } from "node:crypto";
import { postJson } from "../../shared/http.js";
import type {
  PspCreateTransactionRequest,
  PspCreateTransactionResponse,
  PspWebhookPayload,
} from "./psp.schemas.js";

type StoredPspTx = {
  transactionId: string;
  callbackUrl: string;
  amount: number;
  status: "PENDING_3DS" | "SUCCESS" | "FAILED";
};

export class PspSimulatorService {
  private store = new Map<string, StoredPspTx>();

  createTransaction(
    req: PspCreateTransactionRequest,
  ): PspCreateTransactionResponse {
    const txId = `tx_${randomUUID().slice(0, 8)}`;

    const prefix = req.cardNumber.slice(0, 4);

    if (prefix === "4111") {
      this.store.set(txId, {
        transactionId: txId,
        callbackUrl: req.callbackUrl,
        amount: req.amount,
        status: "PENDING_3DS",
      });

      return {
        transactionId: txId,
        status: "PENDING_3DS",
        threeDsRedirectUrl: `http://localhost:3000/psp/3ds/${txId}`,
      };
    }

    if (prefix === "5555") {
      this.store.set(txId, {
        transactionId: txId,
        callbackUrl: req.callbackUrl,
        amount: req.amount,
        status: "SUCCESS",
      });

      setTimeout(() => {
        void this.sendWebhook(req.callbackUrl, {
          transactionId: txId,
          final_amount: req.amount,
          status: "SUCCESS",
        });
      }, 700);

      return { transactionId: txId, status: "SUCCESS" };
    }

    if (prefix === "4000") {
      this.store.set(txId, {
        transactionId: txId,
        callbackUrl: req.callbackUrl,
        amount: req.amount,
        status: "FAILED",
      });

      setTimeout(() => {
        void this.sendWebhook(req.callbackUrl, {
          transactionId: txId,
          final_amount: req.amount,
          status: "FAILED",
        });
      }, 700);

      return { transactionId: txId, status: "FAILED" };
    }

    this.store.set(txId, {
      transactionId: txId,
      callbackUrl: req.callbackUrl,
      amount: req.amount,
      status: "FAILED",
    });

    setTimeout(() => {
      void this.sendWebhook(req.callbackUrl, {
        transactionId: txId,
        final_amount: req.amount,
        status: "FAILED",
      });
    }, 700);

    return { transactionId: txId, status: "FAILED" };
  }

  async complete3ds(txId: string, result: "success" | "failed") {
    const tx = this.store.get(txId);
    if (!tx) return { found: false as const };

    const finalStatus = result === "success" ? "SUCCESS" : "FAILED";

    setTimeout(() => {
      void this.sendWebhook(tx.callbackUrl, {
        transactionId: txId,
        final_amount: tx.amount,
        status: finalStatus,
      });
    }, 1200);

    return { found: true as const, finalStatus };
  }

  private async sendWebhook(url: string, payload: PspWebhookPayload) {
    try {
      await postJson(url, payload, { timeoutMs: 4000 });
    } catch {}
  }
}
