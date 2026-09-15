import { describe, it, expect } from "vitest";
import { createBookingId } from "@/lib/booking/bookingId";

describe("createBookingId", () => {
  it("respecte le format VGYYMMDD-XXXX", () => {
    expect(createBookingId("2026-09-15", () => 3812)).toBe("VG260915-3812");
  });

  it("complète le suffixe avec des zéros", () => {
    expect(createBookingId("2026-01-02", () => 7)).toBe("VG260102-0007");
  });

  it("produit toujours un identifiant valide", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(createBookingId("2026-12-31")).toMatch(/^VG\d{6}-\d{4}$/);
    }
  });
});
