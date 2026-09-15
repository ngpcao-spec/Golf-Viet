import { describe, it, expect } from "vitest";
import { courses } from "@/data/courses";
import { generateTeeTimes } from "@/data/seedTeeTimes";
import { demoDates, todayIso, tomorrowIso, addDaysIso } from "@/lib/dates/demoDates";

describe("generateTeeTimes", () => {
  it("est déterministe pour une même entrée", () => {
    const a = generateTeeTimes("vietnam-golf-country-club", "2026-09-16");
    const b = generateTeeTimes("vietnam-golf-country-club", "2026-09-16");
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(5);
  });

  it("produit des sélections différentes selon le parcours", () => {
    const a = generateTeeTimes("vietnam-golf-country-club", "2026-09-16").map((t) => t.time);
    const b = generateTeeTimes("harmonie-golf-park", "2026-09-16").map((t) => t.time);
    expect(a).not.toEqual(b);
  });

  it("garde des données cohérentes", () => {
    for (const course of courses) {
      for (const teeTime of generateTeeTimes(course.id, "2027-03-01")) {
        expect(teeTime.price).toBeGreaterThan(0);
        expect(Number.isInteger(teeTime.price)).toBe(true);
        expect(teeTime.remainingSlots).toBeGreaterThanOrEqual(0);
        expect(teeTime.remainingSlots).toBeLessThanOrEqual(4);
        expect(teeTime.status).toBe(teeTime.remainingSlots > 0 ? "available" : "full");
        if (teeTime.discountPercent > 0) {
          expect(teeTime.originalPrice).toBeGreaterThan(teeTime.price);
        } else {
          expect(teeTime.originalPrice).toBeNull();
        }
      }
    }
  });

  it("reste utilisable dans le futur, sans date figée", () => {
    const future = addDaysIso(todayIso(), 400);
    expect(generateTeeTimes("long-thanh-golf-club", future).length).toBeGreaterThan(0);
  });
});

describe("demoDates", () => {
  it("commence aujourd'hui et couvre au moins 7 jours", () => {
    const dates = demoDates(8);
    expect(dates).toHaveLength(8);
    expect(dates[0]).toBe(todayIso());
    expect(dates[1]).toBe(tomorrowIso());
    expect(new Set(dates).size).toBe(8);
  });
});

describe("libellés de date en vietnamien", () => {
  it("formate les jours comme la maquette", async () => {
    const { weekdayShortVi, dayMonth, longDateVi, mediumDateVi } = await import(
      "@/lib/dates/demoDates"
    );
    expect(weekdayShortVi("2026-09-11")).toBe("Thứ 6");
    expect(weekdayShortVi("2026-09-13")).toBe("CN");
    expect(dayMonth("2026-08-15")).toBe("15/08");
    expect(longDateVi("2026-08-15")).toBe("Thứ 7, 15/08/2026");
    expect(mediumDateVi("2026-08-15")).toBe("Thứ 7, 15/08");
  });
});
