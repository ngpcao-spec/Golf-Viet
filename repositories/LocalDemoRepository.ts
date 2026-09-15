"use client";

import { courses, coursesById, coursesBySlug } from "@/data/courses";
import { generateTeeTimes } from "@/data/seedTeeTimes";
import { useDemoStore } from "@/store/demoStore";
import type { GolfRepository } from "@/repositories/GolfRepository";
import type { GolfCourse, TeeTime } from "@/types/golf";
import type { Booking } from "@/types/booking";

function sortByTime(list: TeeTime[]): TeeTime[] {
  return [...list].sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Fusionne le dataset embarqué avec les modifications locales de démonstration.
 * Fonction pure : elle sert aussi de sélecteur mémoïsable côté React.
 */
export function mergeTeeTimes(
  golfId: string,
  date: string,
  teeTimeOverrides: Record<string, TeeTime>,
  deletedTeeTimeIds: string[],
): TeeTime[] {
  const deleted = new Set(deletedTeeTimeIds);
  const seed = generateTeeTimes(golfId, date);
  const seededIds = new Set(seed.map((t) => t.id));

  const seeded = seed
    .filter((t) => !deleted.has(t.id))
    .map((t) => teeTimeOverrides[t.id] ?? t);

  const extras = Object.values(teeTimeOverrides).filter(
    (t) => t.golfId === golfId && t.date === date && !seededIds.has(t.id) && !deleted.has(t.id),
  );

  return sortByTime([...seeded, ...extras]);
}

function mergeFromStore(golfId: string, date: string): TeeTime[] {
  const { teeTimeOverrides, deletedTeeTimeIds } = useDemoStore.getState();
  return mergeTeeTimes(golfId, date, teeTimeOverrides, deletedTeeTimeIds);
}

/**
 * Implémentation V1 : dataset embarqué + surcouche localStorage.
 * `satisfies` conserve les signatures synchrones précises pour l'UI
 * tout en garantissant la conformité au contrat `GolfRepository`.
 */
export const localDemoRepository = {
  getCourses(): GolfCourse[] {
    return courses;
  },

  getCourseBySlug(slug: string): GolfCourse | null {
    return coursesBySlug.get(slug) ?? null;
  },

  getCourseById(id: string): GolfCourse | null {
    return coursesById.get(id) ?? null;
  },

  getTeeTimes(golfId: string, date: string): TeeTime[] {
    return mergeFromStore(golfId, date);
  },

  getTeeTime(id: string): TeeTime | null {
    const { teeTimeOverrides, deletedTeeTimeIds } = useDemoStore.getState();
    if (deletedTeeTimeIds.includes(id)) return null;
    const override = teeTimeOverrides[id];
    if (override) return override;

    // L'identifiant encode `<golfId>-<date>-<HHmm>`, on régénère la journée.
    const match = /^(.*)-(\d{4}-\d{2}-\d{2})-(\d{4})$/.exec(id);
    if (!match) return null;
    const [, golfId, date] = match;
    if (!golfId || !date) return null;
    return mergeFromStore(golfId, date).find((t) => t.id === id) ?? null;
  },

  updateTeeTime(teeTime: TeeTime): void {
    useDemoStore.getState().upsertTeeTime(teeTime);
  },

  createTeeTime(teeTime: TeeTime): void {
    useDemoStore.getState().upsertTeeTime(teeTime);
  },

  deleteTeeTime(id: string): void {
    useDemoStore.getState().deleteTeeTime(id);
  },

  createBooking(booking: Booking): void {
    useDemoStore.getState().addBooking(booking);
  },

  getBooking(id: string): Booking | null {
    return useDemoStore.getState().bookings[id] ?? null;
  },

  resetDemoData(): void {
    useDemoStore.getState().resetDemoData();
  },
} satisfies GolfRepository;
