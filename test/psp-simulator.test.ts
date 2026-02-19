import { describe, it, expect } from "vitest";
import { PspSimulatorService } from "../src/modules/psp/psp.service.js";

describe("PSP Simulator", () => {
  it("returns PENDING_3DS for 4111 cards", () => {
    const psp = new PspSimulatorService();

    const res = psp.createTransaction({
      amount: 100,
      currency: "EUR",
      cardNumber: "4111111111111111",
      cardExpiry: "12/25",
      cvv: "123",
      orderId: "order1",
      callbackUrl: "http://test",
      failureUrl: "http://test",
    });

    expect(res.status).toBe("PENDING_3DS");
  });

  it("returns SUCCESS for 5555 cards", () => {
    const psp = new PspSimulatorService();

    const res = psp.createTransaction({
      amount: 100,
      currency: "EUR",
      cardNumber: "5555111111111111",
      cardExpiry: "12/25",
      cvv: "123",
      orderId: "order1",
      callbackUrl: "http://test",
      failureUrl: "http://test",
    });

    expect(res.status).toBe("SUCCESS");
  });

  it("returns FAILED for 4000 cards", () => {
    const psp = new PspSimulatorService();

    const res = psp.createTransaction({
      amount: 100,
      currency: "EUR",
      cardNumber: "4000111111111111",
      cardExpiry: "12/25",
      cvv: "123",
      orderId: "order1",
      callbackUrl: "http://test",
      failureUrl: "http://test",
    });

    expect(res.status).toBe("FAILED");
  });
});
