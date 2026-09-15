import { format } from "date-fns";
import { vi } from "date-fns/locale";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Date du jour au format `yyyy-MM-dd`, toujours calculée dans le fuseau du Vietnam
 * afin que le rendu serveur et le rendu client restent identiques.
 */
export function todayIso(): string {
  return isoFormatter.format(new Date());
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function addDaysIso(iso: string, days: number): string {
  const date = parseIso(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return isoFormatter.format(date);
}

/** Liste des dates de démonstration : aujourd'hui + `count - 1` jours. */
export function demoDates(count = 8): string[] {
  const start = todayIso();
  return Array.from({ length: count }, (_, i) => addDaysIso(start, i));
}

export function tomorrowIso(): string {
  return addDaysIso(todayIso(), 1);
}

export function isValidDemoDate(iso: string, count = 8): boolean {
  return demoDates(count).includes(iso);
}

/**
 * Date locale construite à partir des champs calendaires : le résultat du
 * formatage ne dépend donc pas du fuseau de la machine.
 */
function toLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function dayNumber(iso: string): number {
  return toLocalDate(iso).getDay();
}

/** Ex. "Thứ 6" / "CN" — `date-fns` renvoie "Th 6", on rétablit le diacritique. */
export function weekdayShortVi(iso: string): string {
  const label = format(toLocalDate(iso), "EEEEEE", { locale: vi });
  return label.startsWith("Th ") ? label.replace("Th ", "Thứ ") : label;
}

/** Ex. "15/08". */
export function dayMonth(iso: string): string {
  return format(toLocalDate(iso), "dd/MM", { locale: vi });
}

/** Ex. "Thứ 6, 15/08/2026". */
export function longDateVi(iso: string): string {
  return `${weekdayShortVi(iso)}, ${format(toLocalDate(iso), "dd/MM/yyyy", { locale: vi })}`;
}

/** Ex. "Thứ 6, 15/08". */
export function mediumDateVi(iso: string): string {
  return `${weekdayShortVi(iso)}, ${dayMonth(iso)}`;
}
