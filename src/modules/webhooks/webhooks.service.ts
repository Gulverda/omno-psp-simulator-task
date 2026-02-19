import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
import {
  assertTransition,
  type TransactionStatus,
} from "../transactions/transactions.domain.js";

type PspWebhookBody = {
  transactionId: string;
  final_amount: number;
  status: "SUCCESS" | "FAILED" | "3DS_REQUIRED";
};

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function mapPspStatusToInternal(
  psp: PspWebhookBody["status"],
): TransactionStatus {
  if (psp === "SUCCESS") return "SUCCESS";
  if (psp === "FAILED") return "FAILED";
  return "PENDING_3DS";
}

export function webhooksService(app: FastifyInstance) {
  return {
    async processPspWebhook(
      body: PspWebhookBody,
    ): Promise<{ ok: true; ignored: boolean }> {
      const payloadHash = sha256(JSON.stringify(body));
      const insertEvent = await app.db.query(
        `
        INSERT INTO webhook_events (id, psp_transaction_id, status, final_amount, payload_hash)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        ON CONFLICT (payload_hash) DO NOTHING
        RETURNING id
        `,
        [body.transactionId, body.status, body.final_amount, payloadHash],
      );

      if (insertEvent.rowCount === 0) {
        return { ok: true, ignored: true };
      }

      const txRes = await app.db.query(
        `SELECT id, status FROM transactions WHERE psp_transaction_id = $1`,
        [body.transactionId],
      );

      if (txRes.rowCount === 0) {
        return { ok: true, ignored: true };
      }

      const tx = txRes.rows[0] as { id: string; status: TransactionStatus };

      const nextStatus = mapPspStatusToInternal(body.status);
      assertTransition(tx.status, nextStatus);

      await app.db.query(
        `
        UPDATE transactions
        SET status = $1,
            final_amount = $2,
            updated_at = now()
        WHERE id = $3
        `,
        [nextStatus, body.final_amount, tx.id],
      );

      return { ok: true, ignored: false };
    },
  };
}
