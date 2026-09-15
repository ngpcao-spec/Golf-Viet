import { describe, it, expect } from "vitest";
import { applyBooking, NOT_ENOUGH_SLOTS_MESSAGE } from "@/lib/booking/applyBooking";
import type { TeeTime } from "@/types/golf";

const baseTeeTime: TeeTime = {
  id: "vietnam-golf-country-club-2026-09-16-0700",
  golfId: "vietnam-golf-country-club",
  date: "2026-09-16",
  time: "07:00",
  price: 2400000,
  originalPrice: 3000000,
  discountPercent: 20,
  remainingSlots: 4,
  status: "available",
};

describe("applyBooking", () => {
  it("décrémente les places restantes", () => {
    const result = applyBooking(baseTeeTime, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.updatedTeeTime.remainingSlots).toBe(2);
    expect(result.updatedTeeTime.status).toBe("available");
    expect(result.booking.totalPrice).toBe(4800000);
    expect(result.booking.status).toBe("confirmed");
  });

  it("passe le créneau en full quand il ne reste plus de place", () => {
    const result = applyBooking({ ...baseTeeTime, remainingSlots: 2 }, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.updatedTeeTime.remainingSlots).toBe(0);
    expect(result.updatedTeeTime.status).toBe("full");
  });

  it("refuse la réservation si les places sont insuffisantes", () => {
    const result = applyBooking({ ...baseTeeTime, remainingSlots: 1 }, 3);
    expect(result).toEqual({ ok: false, error: NOT_ENOUGH_SLOTS_MESSAGE });
  });

  it("refuse la réservation sur un créneau complet", () => {
    const result = applyBooking(
      { ...baseTeeTime, remainingSlots: 0, status: "full" },
      1,
    );
    expect(result.ok).toBe(false);
  });

  it("empêche une seconde réservation au-delà du stock (double submission)", () => {
    const first = applyBooking({ ...baseTeeTime, remainingSlots: 2 }, 2);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = applyBooking(first.updatedTeeTime, 2);
    expect(second.ok).toBe(false);
  });
});
