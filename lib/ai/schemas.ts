import { z } from "zod";

export const assistantAnswersSchema = z.object({
  skill: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  style: z.enum(["relaxing", "technical", "premium", "scenic", "any"]),
  budget: z.enum(["under_1500", "1500_2500", "2500_4000", "any"]),
  distance: z.enum(["15", "30", "50", "any"]),
  priority: z.enum(["price", "quality", "distance", "reviews", "availability"]),
});

export const scoredCourseSchema = z.object({
  golfId: z.string(),
  slug: z.string(),
  score: z.number(),
  matchPercent: z.number(),
  cheapestPrice: z.number(),
  earliestTime: z.string().nullable(),
  availableCount: z.number(),
});

export const recommendRequestSchema = z.object({
  answers: assistantAnswersSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  players: z.number().int().min(1).max(4).optional(),
  // Classement déterministe calculé côté client (il connaît les données
  // de démonstration modifiées localement). Optionnel : sinon recalculé ici.
  ranked: z.array(scoredCourseSchema).max(6).optional(),
});

export const aiRecommendationSchema = z.object({
  golfId: z.string().min(1),
  headline: z.string().min(1).max(80),
  reason: z.string().min(1).max(400),
  highlights: z.array(z.string().min(1).max(60)).max(3),
});

export const aiPayloadSchema = z.object({
  recommendations: z.array(aiRecommendationSchema).min(1),
});

export const recommendResponseSchema = z.object({
  source: z.enum(["openai", "fallback"]),
  ranked: z.array(scoredCourseSchema),
  recommendations: z.array(aiRecommendationSchema),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
export type RecommendResponsePayload = z.infer<typeof recommendResponseSchema>;
