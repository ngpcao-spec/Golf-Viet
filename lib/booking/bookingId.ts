/**
 * Identifiant de réservation au format `VGYYMMDD-XXXX`, ex. `VG260915-3812`.
 * `randomInt` est injectable pour rendre la génération testable.
 */
export function createBookingId(
  dateIso: string,
  randomInt: () => number = () => Math.floor(Math.random() * 10000),
): string {
  const [y = "0000", m = "01", d = "01"] = dateIso.split("-");
  const suffix = String(Math.abs(Math.floor(randomInt())) % 10000).padStart(4, "0");
  return `VG${y.slice(-2)}${m}${d}-${suffix}`;
}
