import type { TeeTime } from "@/types/golf";
import type { Booking } from "@/types/booking";
import { createBookingId } from "@/lib/booking/bookingId";

export const NOT_ENOUGH_SLOTS_MESSAGE = "Giờ phát bóng này không còn đủ chỗ.";

export type BookingResult =
  | { ok: true; booking: Booking; updatedTeeTime: TeeTime }
  | { ok: false; error: string };

/**
 * Applique une réservation de démonstration : vérifie la disponibilité,
 * décrémente les places restantes et bascule le créneau en `full` à zéro.
 */
export function applyBooking(
  teeTime: TeeTime,
  players: number,
  options: { now?: Date; randomInt?: () => number } = {},
): BookingResult {
  if (players < 1) {
    return { ok: false, error: NOT_ENOUGH_SLOTS_MESSAGE };
  }
  if (teeTime.status === "full" || teeTime.remainingSlots < players) {
    return { ok: false, error: NOT_ENOUGH_SLOTS_MESSAGE };
  }

  const remainingSlots = teeTime.remainingSlots - players;
  const updatedTeeTime: TeeTime = {
    ...teeTime,
    remainingSlots,
    status: remainingSlots > 0 ? "available" : "full",
  };

  const now = options.now ?? new Date();
  const booking: Booking = {
    id: createBookingId(teeTime.date, options.randomInt),
    golfId: teeTime.golfId,
    teeTimeId: teeTime.id,
    date: teeTime.date,
    time: teeTime.time,
    players,
    unitPrice: teeTime.price,
    totalPrice: teeTime.price * players,
    createdAt: now.toISOString(),
    status: "confirmed",
  };

  return { ok: true, booking, updatedTeeTime };
}
