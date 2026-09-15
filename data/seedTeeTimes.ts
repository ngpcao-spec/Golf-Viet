import { courses } from "@/data/courses";
import type { TeeTime } from "@/types/golf";

const MORNING_SLOTS = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
];

const AFTERNOON_SLOTS = ["13:00", "13:30", "14:00", "14:30", "15:00"];

const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

const DISCOUNTS = [30, 20, 15];

/** Hash déterministe : même entrée -> même sortie sur serveur et client. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pseudoRandom(seed: string): number {
  return hash(seed) / 0xffffffff;
}

function roundPrice(value: number): number {
  return Math.round(value / 100000) * 100000;
}

/**
 * Prix de base modulé par le créneau : les départs de milieu de matinée
 * sont les plus chers, l'après-midi est plus accessible.
 */
function slotMultiplier(time: string): number {
  const index = ALL_SLOTS.indexOf(time);
  if (index < 0) return 1;
  if (time >= "13:00") return 0.82;
  if (index <= 1) return 0.94;
  if (index <= 5) return 1.12;
  return 1.04;
}

function slotsForCourse(golfId: string): string[] {
  const offset = hash(golfId) % 3;
  const morning = MORNING_SLOTS.filter((_, i) => (i + offset) % 5 !== 4);
  const afternoon = AFTERNOON_SLOTS.filter((_, i) => (i + offset) % 3 !== 2);
  return [...morning, ...afternoon];
}

function buildTeeTime(
  golfId: string,
  basePrice: number,
  date: string,
  time: string,
): TeeTime {
  const seed = `${golfId}|${date}|${time}`;
  const r = pseudoRandom(seed);
  const full = roundPrice(basePrice * slotMultiplier(time));

  // Environ un créneau sur quatre est en promotion.
  const hasDiscount = r > 0.74;
  const discountPercent = hasDiscount
    ? (DISCOUNTS[hash(`${seed}|d`) % DISCOUNTS.length] as number)
    : 0;
  const price = hasDiscount ? roundPrice(full * (1 - discountPercent / 100)) : full;

  const slotSeed = pseudoRandom(`${seed}|slots`);
  let remainingSlots = 4;
  if (slotSeed < 0.08) remainingSlots = 0;
  else if (slotSeed < 0.24) remainingSlots = 1;
  else if (slotSeed < 0.46) remainingSlots = 2;
  else if (slotSeed < 0.66) remainingSlots = 3;

  return {
    id: `${golfId}-${date}-${time.replace(":", "")}`,
    golfId,
    date,
    time,
    price,
    originalPrice: hasDiscount ? full : null,
    discountPercent,
    remainingSlots,
    status: remainingSlots > 0 ? "available" : "full",
  };
}

/** Génère les tee times d'un parcours pour une date donnée. */
export function generateTeeTimes(golfId: string, date: string): TeeTime[] {
  const course = courses.find((c) => c.id === golfId);
  if (!course) return [];
  return slotsForCourse(golfId).map((time) =>
    buildTeeTime(golfId, course.basePrice, date, time),
  );
}

/** Génère les tee times de tous les parcours pour une liste de dates. */
export function generateAllTeeTimes(dates: string[]): TeeTime[] {
  return dates.flatMap((date) =>
    courses.flatMap((course) => generateTeeTimes(course.id, date)),
  );
}
