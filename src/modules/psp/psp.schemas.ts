export type PspCreateTransactionRequest = {
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  orderId: string;
  callbackUrl: string;
  failureUrl: string;
};

export type PspCreateTransactionResponse =
  | {
      transactionId: string;
      status: "PENDING_3DS";
      threeDsRedirectUrl: string;
    }
  | {
      transactionId: string;
      status: "SUCCESS" | "FAILED";
    };

export type PspWebhookPayload = {
  transactionId: string;
  final_amount: number;
  status: "SUCCESS" | "FAILED" | "3DS_REQUIRED";
};
