import type { FastifyInstance } from "fastify";
import type { TransactionStatus } from "./transactions.domain.js";

export type TransactionRow = {
  id: string;
  order_id: string;
  psp_transaction_id: string | null;
  status: TransactionStatus;
  amount: number;
  currency: string;
  final_amount: number | null;
};

export function transactionsRepo(app: FastifyInstance) {
  return {
    async create(input: {
      id: string;
      orderId: string;
      amount: number;
      currency: string;
    }): Promise<void> {
      await app.db.query(
        `
        INSERT INTO transactions (id, order_id, status, amount, currency)
        VALUES ($1, $2, 'CREATED', $3, $4)
        `,
        [input.id, input.orderId, input.amount, input.currency],
      );
    },

    async getById(id: string): Promise<TransactionRow | null> {
      const res = await app.db.query(
        `SELECT * FROM transactions WHERE id = $1`,
        [id],
      );
      return res.rowCount ? (res.rows[0] as TransactionRow) : null;
    },

    async attachPspIdAndStatus(input: {
      id: string;
      pspTransactionId: string;
      nextStatus: TransactionStatus;
    }): Promise<void> {
      await app.db.query(
        `
        UPDATE transactions
        SET psp_transaction_id = $1,
            status = $2,
            updated_at = now()
        WHERE id = $3
        `,
        [input.pspTransactionId, input.nextStatus, input.id],
      );
    },
  };
}
