import type { GolfCourse, TeeTime } from "@/types/golf";
import type {
  AssistantAnswers,
  BudgetChoice,
  DistanceChoice,
  PriorityChoice,
  ScoredCourse,
  SkillLevel,
} from "@/types/assistant";

export const MAX_SCORE = 100;
export const WEIGHTS = {
  skill: 20,
  style: 20,
  budget: 20,
  distance: 15,
  priority: 25,
} as const;

/** Statistiques de disponibilité d'un parcours pour la journée analysée. */
export type CourseAvailability = {
  cheapestPrice: number;
  earliestTime: string | null;
  availableCount: number;
  earlyCount: number;
};

export type Candidate = {
  course: GolfCourse;
  availability: CourseAvailability;
};

const SKILL_MATRIX: Record<SkillLevel, Record<GolfCourse["difficulty"], number>> = {
  beginner: { easy: 20, medium: 12, hard: 5, championship: 2 },
  intermediate: { easy: 18, medium: 20, hard: 10, championship: 6 },
  advanced: { easy: 8, medium: 18, hard: 20, championship: 16 },
  expert: { easy: 4, medium: 10, hard: 20, championship: 20 },
};

const BUDGET_RANGES: Record<Exclude<BudgetChoice, "any">, [number, number]> = {
  under_1500: [0, 1_500_000],
  "1500_2500": [1_500_000, 2_500_000],
  "2500_4000": [2_500_000, 4_000_000],
};

/** Statistiques de disponibilité calculées à partir des tee times d'un parcours. */
export function buildAvailability(
  teeTimes: TeeTime[],
  fallbackPrice: number,
): CourseAvailability {
  const available = teeTimes.filter((t) => t.status === "available" && t.remainingSlots > 0);
  const sorted = [...available].sort((a, b) => a.time.localeCompare(b.time));
  const cheapest = available.reduce(
    (min, t) => (t.price < min ? t.price : min),
    Number.POSITIVE_INFINITY,
  );
  return {
    cheapestPrice: Number.isFinite(cheapest) ? cheapest : fallbackPrice,
    earliestTime: sorted[0]?.time ?? null,
    availableCount: available.length,
    earlyCount: available.filter((t) => t.time < "09:00").length,
  };
}

function skillScore(skill: SkillLevel, difficulty: GolfCourse["difficulty"]): number {
  return SKILL_MATRIX[skill][difficulty];
}

function styleScore(style: AssistantAnswers["style"], tags: string[]): number {
  if (style === "any") return WEIGHTS.style;
  if (tags.includes(style)) return WEIGHTS.style;
  // Un parcours proche mais non étiqueté conserve une partie des points.
  return WEIGHTS.style * 0.4;
}

function budgetScore(budget: BudgetChoice, price: number): number {
  if (budget === "any") return WEIGHTS.budget;
  const [min, max] = BUDGET_RANGES[budget];
  if (price >= min && price <= max) return WEIGHTS.budget;
  const gap = price > max ? price - max : min - price;
  const tolerance = 1_500_000;
  const ratio = Math.min(gap / tolerance, 1);
  return WEIGHTS.budget * (1 - ratio);
}

function distanceScore(distance: DistanceChoice, distanceKm: number): number {
  if (distance === "any") return WEIGHTS.distance;
  const max = Number(distance);
  if (distanceKm <= max) {
    // Dans la limite demandée : plus c'est proche, mieux c'est noté.
    return WEIGHTS.distance * (1 - 0.25 * (distanceKm / max));
  }
  const overflow = Math.min((distanceKm - max) / max, 1);
  return WEIGHTS.distance * 0.4 * (1 - overflow);
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return (value - min) / (max - min);
}

function priorityScore(
  priority: PriorityChoice,
  candidate: Candidate,
  bounds: {
    minPrice: number;
    maxPrice: number;
    minDistance: number;
    maxDistance: number;
    maxEarly: number;
  },
): number {
  const { course, availability } = candidate;
  switch (priority) {
    case "price":
      return (
        WEIGHTS.priority *
        (1 - normalize(availability.cheapestPrice, bounds.minPrice, bounds.maxPrice))
      );
    case "quality":
      return WEIGHTS.priority * (course.courseScore / 10);
    case "distance":
      return (
        WEIGHTS.priority *
        (1 - normalize(course.distanceKm, bounds.minDistance, bounds.maxDistance))
      );
    case "reviews":
      return WEIGHTS.priority * (course.rating / 5);
    case "availability":
      return (
        WEIGHTS.priority *
        (bounds.maxEarly === 0 ? 0 : availability.earlyCount / bounds.maxEarly)
      );
    default:
      return 0;
  }
}

/** Convertit un score brut sur 100 en pourcentage d'affichage lisible. */
export function toMatchPercent(score: number): number {
  return Math.max(55, Math.min(98, Math.round(score)));
}

/**
 * Classement déterministe des parcours. L'IA n'intervient jamais ici :
 * elle ne fait qu'habiller le résultat produit par cette fonction.
 */
export function rankCourses(
  candidates: Candidate[],
  answers: AssistantAnswers,
  limit = 3,
): ScoredCourse[] {
  if (candidates.length === 0) return [];

  const prices = candidates.map((c) => c.availability.cheapestPrice);
  const distances = candidates.map((c) => c.course.distanceKm);
  const bounds = {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minDistance: Math.min(...distances),
    maxDistance: Math.max(...distances),
    maxEarly: Math.max(...candidates.map((c) => c.availability.earlyCount)),
  };

  return candidates
    .map((candidate) => {
      const score =
        skillScore(answers.skill, candidate.course.difficulty) +
        styleScore(answers.style, candidate.course.experienceTags) +
        budgetScore(answers.budget, candidate.availability.cheapestPrice) +
        distanceScore(answers.distance, candidate.course.distanceKm) +
        priorityScore(answers.priority, candidate, bounds);

      return {
        golfId: candidate.course.id,
        slug: candidate.course.slug,
        score: Math.round(score * 100) / 100,
        matchPercent: toMatchPercent(score),
        cheapestPrice: candidate.availability.cheapestPrice,
        earliestTime: candidate.availability.earliestTime,
        availableCount: candidate.availability.availableCount,
      } satisfies ScoredCourse;
    })
    .sort((a, b) => b.score - a.score || a.golfId.localeCompare(b.golfId))
    .slice(0, limit);
}
