import { describe, it, expect } from "vitest";
import { formatVND } from "@/lib/money/formatVND";

describe("formatVND", () => {
  it("formate un montant en millions", () => {
    expect(formatVND(2400000)).toBe("2.400.000₫");
  });

  it("formate les petits montants", () => {
    expect(formatVND(0)).toBe("0₫");
    expect(formatVND(950)).toBe("950₫");
    expect(formatVND(12000)).toBe("12.000₫");
  });

  it("arrondit les décimales", () => {
    expect(formatVND(1499999.6)).toBe("1.500.000₫");
  });
});
