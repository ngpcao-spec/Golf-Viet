import { describe, it, expect } from "vitest";
import {
  HERO_IMAGE,
  heroMapping,
  introEndTransform,
  type Rect,
} from "@/lib/intro/heroFraming";

const S = 1254;

function project(mapping: { originX: number; originY: number; scale: number }, px: number, py: number) {
  return { x: mapping.originX + mapping.scale * px, y: mapping.originY + mapping.scale * py };
}

describe("heroMapping", () => {
  it("reproduit object-fit: cover centré quand le zoom vaut 1", () => {
    const hero: Rect = { x: 0, y: 0, width: 390, height: 380 };
    const m = heroMapping(hero, S, { focalX: 0.5, focalY: 0.5, zoom: 1 });
    expect(m.scale).toBeCloseTo(390 / S);
    expect(m.originX).toBeCloseTo(0);
    expect(m.originY).toBeCloseTo(-5); // 10 px de débord, répartis haut/bas
  });

  it("maintient le point focal au même endroit de la boîte malgré le zoom", () => {
    const hero: Rect = { x: 0, y: 0, width: 375, height: 300 };
    const framing = { focalX: 0.7, focalY: 0.46, zoom: 1.22 };
    const m = heroMapping(hero, S, framing);
    const focal = project(m, framing.focalX * S, framing.focalY * S);
    expect(focal.x).toBeCloseTo(0.7 * 375);
    expect(focal.y).toBeCloseTo(0.46 * 300);
    expect(m.scale).toBeCloseTo((375 / S) * 1.22);
  });

  it("couvre toujours entièrement la boîte du hero", () => {
    for (const [w, h] of [
      [375, 300],
      [390, 380],
      [430, 419],
      [480, 450],
    ] as const) {
      const hero: Rect = { x: 0, y: 0, width: w, height: h };
      const m = heroMapping(hero, S, HERO_IMAGE);
      const topLeft = project(m, 0, 0);
      const bottomRight = project(m, S, S);
      expect(topLeft.x).toBeLessThanOrEqual(0.001);
      expect(topLeft.y).toBeLessThanOrEqual(0.001);
      expect(bottomRight.x).toBeGreaterThanOrEqual(w - 0.001);
      expect(bottomRight.y).toBeGreaterThanOrEqual(h - 0.001);
    }
  });
});

describe("introEndTransform", () => {
  it("amène exactement la photo de départ sur le mapping du hero", () => {
    const start: Rect = { x: 0, y: 227, width: 390, height: 390 };
    const hero: Rect = { x: 0, y: 0, width: 390, height: 380 };
    const end = heroMapping(hero, S, HERO_IMAGE);
    const t = introEndTransform(start, end, S);

    // Un pixel image P est d'abord affiché en start + P * (390 / S),
    // puis la transform (origine 0 0) le déplace en start + t + k * local.
    for (const [px, py] of [
      [0, 0],
      [S, S],
      [S * 0.3, S * 0.8],
    ] as const) {
      const local = { x: (px * start.width) / S, y: (py * start.height) / S };
      const screen = {
        x: start.x + t.translateX + t.scale * local.x,
        y: start.y + t.translateY + t.scale * local.y,
      };
      const expected = project(end, px, py);
      expect(screen.x).toBeCloseTo(expected.x);
      expect(screen.y).toBeCloseTo(expected.y);
    }
  });

  it("fait avancer la caméra : l'échelle finale est supérieure à celle de départ", () => {
    const start: Rect = { x: 0, y: 183, width: 375, height: 375 };
    const end = heroMapping({ x: 0, y: 0, width: 375, height: 300 }, S, HERO_IMAGE);
    expect(introEndTransform(start, end, S).scale).toBeGreaterThan(1);
  });
});
