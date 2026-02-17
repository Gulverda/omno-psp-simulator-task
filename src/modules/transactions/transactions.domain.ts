export type TransactionStatus =
  | "CREATED"
  | "PENDING_3DS"
  | "SUCCESS"
  | "FAILED";

const allowedTransitions: Record<TransactionStatus, TransactionStatus[]> = {
  CREATED: ["PENDING_3DS", "SUCCESS", "FAILED"],
  PENDING_3DS: ["SUCCESS", "FAILED"],
  SUCCESS: [],
  FAILED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: TransactionStatus, to: TransactionStatus) {
    super(`Invalid transaction state transition: ${from} -> ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function assertTransition(
  from: TransactionStatus,
  to: TransactionStatus,
) {
  const allowed = allowedTransitions[from] ?? [];
  if (!allowed.includes(to)) throw new InvalidTransitionError(from, to);
}
