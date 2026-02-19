import { describe, it, expect, vi } from "vitest";
import { webhooksService } from "../src/modules/webhooks/webhooks.service.js";

describe("Webhook idempotency", () => {
  it("processes first webhook and ignores duplicate", async () => {
    // mock DB behavior
    const queryMock = vi.fn();

    // 1st insert → rowCount = 1 (new event)
    // 2nd insert → rowCount = 0 (duplicate)
    queryMock
      // insert webhook_events
      .mockResolvedValueOnce({ rowCount: 1 })
      // select transaction
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: "tx1", status: "CREATED" }],
      })
      // update transaction
      .mockResolvedValueOnce({})
      // duplicate insert
      .mockResolvedValueOnce({ rowCount: 0 });

    const fakeApp: any = {
      db: {
        query: queryMock,
      },
    };

    const service = webhooksService(fakeApp);

    const payload = {
      transactionId: "psp_1",
      final_amount: 100,
      status: "SUCCESS" as const,
    };

    const first = await service.processPspWebhook(payload);
    expect(first.ignored).toBe(false);

    const second = await service.processPspWebhook(payload);
    expect(second.ignored).toBe(true);

    expect(queryMock).toHaveBeenCalled();
  });
});
