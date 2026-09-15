import { NextResponse } from "next/server";
import { courses, coursesById } from "@/data/courses";
import { generateTeeTimes } from "@/data/seedTeeTimes";
import { recommendRequestSchema } from "@/lib/ai/schemas";
import { buildAvailability, rankCourses } from "@/lib/ai/recommendationScore";
import { buildFallbackRecommendations } from "@/lib/ai/recommendationFallback";
import { generateAiRecommendations } from "@/lib/ai/openai";
import type { ScoredCourse } from "@/types/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const parsed = recommendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { answers, date, ranked: clientRanked } = parsed.data;

  // Le classement reste déterministe et produit par le code, jamais par l'IA.
  const known = new Set(courses.map((c) => c.id));
  const ranked: ScoredCourse[] =
    clientRanked && clientRanked.length > 0
      ? clientRanked.filter((item) => known.has(item.golfId)).slice(0, 3)
      : rankCourses(
          courses.map((course) => ({
            course,
            availability: buildAvailability(
              generateTeeTimes(course.id, date),
              course.basePrice,
            ),
          })),
          answers,
        );

  if (ranked.length === 0) {
    return NextResponse.json({ source: "fallback", ranked: [], recommendations: [] });
  }

  const aiRecommendations = await generateAiRecommendations(ranked, coursesById, answers);
  const recommendations =
    aiRecommendations ?? buildFallbackRecommendations(ranked, coursesById, answers);

  return NextResponse.json({
    source: aiRecommendations ? "openai" : "fallback",
    ranked,
    recommendations,
  });
}
