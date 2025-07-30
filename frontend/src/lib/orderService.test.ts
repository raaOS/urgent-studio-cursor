// Menggunakan Jest sebagai testing framework
import { describe, expect, it } from "@jest/globals";

import { createOrder } from "@/services/examples/orderService";

describe("createOrder", () => {
  it("should return correct order summary", () => {
    const summary = createOrder("apple", 3);
    expect(summary).toBe("Ordered 3 x apple");
  });
});