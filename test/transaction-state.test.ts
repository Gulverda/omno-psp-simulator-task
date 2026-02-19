import { describe, it, expect } from "vitest";
import { assertTransition } from "../src/modules/transactions/transactions.domain.js";

describe("Transaction state machine", () => {
  it("allows CREATED -> PENDING_3DS", () => {
    expect(() => assertTransition("CREATED", "PENDING_3DS")).not.toThrow();
  });

  it("allows CREATED -> SUCCESS", () => {
    expect(() => assertTransition("CREATED", "SUCCESS")).not.toThrow();
  });

  it("rejects SUCCESS -> CREATED", () => {
    expect(() => assertTransition("SUCCESS", "CREATED")).toThrow();
  });

  it("rejects FAILED -> SUCCESS", () => {
    expect(() => assertTransition("FAILED", "SUCCESS")).toThrow();
  });
});
