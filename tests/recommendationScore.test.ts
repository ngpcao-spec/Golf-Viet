import { describe, it, expect } from "vitest";
import { courses, coursesById } from "@/data/courses";
import { generateTeeTimes } from "@/data/seedTeeTimes";
import {
  buildAvailability,
  rankCourses,
  toMatchPercent,
  type Candidate,
} from "@/lib/ai/recommendationScore";
import { buildFallbackRecommendations } from "@/lib/ai/recommendationFallback";
import type { AssistantAnswers } from "@/types/assistant";

const DATE = "2026-09-16";

function candidates(): Candidate[] {
  return courses.map((course) => ({
    course,
    availability: buildAvailability(generateTeeTimes(course.id, DATE), course.basePrice),
  }));
}

describe("rankCourses", () => {
  it("renvoie exactement un top 3 trié par score décroissant", () => {
    const answers: AssistantAnswers = {
      skill: "intermediate",
      style: "any",
      budget: "any",
      distance: "any",
      priority: "quality",
    };
    const ranked = rankCourses(candidates(), answers);
    expect(ranked).toHaveLength(3);
    expect(ranked[0]!.score).toBeGreaterThanOrEqual(ranked[1]!.score);
    expect(ranked[1]!.score).toBeGreaterThanOrEqual(ranked[2]!.score);
  });

  it("débutant + petit budget privilégie un parcours facile et abordable", () => {
    const answers: AssistantAnswers = {
      skill: "beginner",
      style: "relaxing",
      budget: "under_1500",
      distance: "any",
      priority: "price",
    };
    const ranked = rankCourses(candidates(), answers);
    const top = coursesById.get(ranked[0]!.golfId)!;
    expect(["easy", "medium"]).toContain(top.difficulty);
    expect(ranked[0]!.cheapestPrice).toBeLessThanOrEqual(ranked[2]!.cheapestPrice + 900000);
  });

  it("expert + technique privilégie un parcours difficile", () => {
    const answers: AssistantAnswers = {
      skill: "expert",
      style: "technical",
      budget: "any",
      distance: "any",
      priority: "quality",
    };
    const ranked = rankCourses(candidates(), answers);
    const top = coursesById.get(ranked[0]!.golfId)!;
    expect(["hard", "championship"]).toContain(top.difficulty);
  });

  it("premium + qualité remonte un parcours étiqueté premium", () => {
    const answers: AssistantAnswers = {
      skill: "advanced",
      style: "premium",
      budget: "any",
      distance: "any",
      priority: "quality",
    };
    const ranked = rankCourses(candidates(), answers);
    const top = coursesById.get(ranked[0]!.golfId)!;
    expect(top.experienceTags).toContain("premium");
  });

  it("une distance maximale pénalise les parcours trop éloignés", () => {
    const answers: AssistantAnswers = {
      skill: "intermediate",
      style: "any",
      budget: "any",
      distance: "15",
      priority: "distance",
    };
    const ranked = rankCourses(candidates(), answers);
    expect(coursesById.get(ranked[0]!.golfId)!.distanceKm).toBeLessThanOrEqual(20);
    expect(ranked.map((r) => r.golfId)).not.toContain("long-thanh-golf-club");
  });

  it("un critère `any` ne pénalise jamais le score", () => {
    const list = candidates();
    const withAny = rankCourses(list, {
      skill: "intermediate",
      style: "any",
      budget: "any",
      distance: "any",
      priority: "quality",
    });
    const withStyle = rankCourses(list, {
      skill: "intermediate",
      style: "scenic",
      budget: "any",
      distance: "any",
      priority: "quality",
    });
    const anyTop = withAny[0]!;
    const styleTop = withStyle.find((r) => r.golfId === anyTop.golfId);
    if (styleTop) expect(anyTop.score).toBeGreaterThanOrEqual(styleTop.score);
  });

  it("gère une liste vide", () => {
    expect(
      rankCourses([], {
        skill: "beginner",
        style: "any",
        budget: "any",
        distance: "any",
        priority: "price",
      }),
    ).toEqual([]);
  });
});

describe("toMatchPercent", () => {
  it("borne le pourcentage affiché", () => {
    expect(toMatchPercent(140)).toBe(98);
    expect(toMatchPercent(10)).toBe(55);
    expect(toMatchPercent(88.4)).toBe(88);
  });
});

describe("fallback local (sans clé OpenAI)", () => {
  it("produit une justification vietnamienne et au plus 3 highlights par sân", () => {
    const answers: AssistantAnswers = {
      skill: "intermediate",
      style: "premium",
      budget: "1500_2500",
      distance: "30",
      priority: "availability",
    };
    const ranked = rankCourses(candidates(), answers);
    const recommendations = buildFallbackRecommendations(ranked, coursesById, answers);

    expect(recommendations).toHaveLength(3);
    for (const recommendation of recommendations) {
      expect(recommendation.reason.length).toBeGreaterThan(10);
      expect(recommendation.highlights.length).toBeLessThanOrEqual(3);
      expect(ranked.map((r) => r.golfId)).toContain(recommendation.golfId);
    }
  });
});
