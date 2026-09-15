"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import RecommendationCard from "@/components/ai/RecommendationCard";
import DemoFooter from "@/components/layout/DemoFooter";
import { courses, coursesById } from "@/data/courses";
import { mergeTeeTimes } from "@/repositories/LocalDemoRepository";
import { buildAvailability, rankCourses } from "@/lib/ai/recommendationScore";
import { buildFallbackRecommendations } from "@/lib/ai/recommendationFallback";
import { useDemoStore } from "@/store/demoStore";
import { useHydrated } from "@/lib/useHydrated";
import { useSearch } from "@/lib/useSearch";
import { QUESTIONS } from "@/lib/ai/questions";
import type {
  AiRecommendation,
  AssistantAnswers,
  PartialAssistantAnswers,
  ScoredCourse,
} from "@/types/assistant";

function isComplete(answers: PartialAssistantAnswers): answers is AssistantAnswers {
  return QUESTIONS.every((q) => Boolean(answers[q.key]));
}

export default function AssistantResultsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const answers = useDemoStore((s) => s.assistantAnswers);
  const overrides = useDemoStore((s) => s.teeTimeOverrides);
  const deletedIds = useDemoStore((s) => s.deletedTeeTimeIds);
  const { date } = useSearch();

  const [recommendations, setRecommendations] = useState<AiRecommendation[] | null>(null);
  const [loading, setLoading] = useState(true);

  const ranked: ScoredCourse[] = useMemo(() => {
    if (!isComplete(answers)) return [];
    return rankCourses(
      courses.map((course) => ({
        course,
        availability: buildAvailability(
          mergeTeeTimes(course.id, date, overrides, deletedIds),
          course.basePrice,
        ),
      })),
      answers,
    );
  }, [answers, date, overrides, deletedIds]);

  useEffect(() => {
    if (hydrated && !isComplete(answers)) router.replace("/assistant");
  }, [hydrated, answers, router]);

  useEffect(() => {
    if (!hydrated || !isComplete(answers) || ranked.length === 0) return;

    let cancelled = false;
    const startedAt = Date.now();

    const run = async () => {
      let result: AiRecommendation[] | null = null;
      try {
        const response = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, date, ranked }),
        });
        if (response.ok) {
          const payload = (await response.json()) as { recommendations?: AiRecommendation[] };
          if (payload.recommendations && payload.recommendations.length > 0) {
            result = payload.recommendations;
          }
        }
      } catch {
        // Réseau indisponible : on bascule sur le fallback local, sans erreur visible.
      }

      if (cancelled) return;
      setRecommendations(result ?? buildFallbackRecommendations(ranked, coursesById, answers));

      // Animation de recherche : 800 ms minimum, sans spinner bloquant.
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, wait);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [hydrated, answers, date, ranked]);

  if (!hydrated || loading) {
    return (
      <main className="safe-top flex min-h-[80dvh] flex-col items-center justify-center px-8 text-center">
        <span className="flex size-16 animate-pulse items-center justify-center rounded-full border border-[rgba(216,180,90,0.4)] bg-[rgba(216,180,90,0.08)]">
          <Sparkles className="size-7 text-gold" aria-hidden="true" />
        </span>
        <p
          className="mt-5 font-[family-name:var(--font-display)] text-[21px] font-semibold"
          role="status"
        >
          Đang tìm sân phù hợp nhất cho bạn...
        </p>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <AppHeader
        title="3 sân phù hợp nhất với bạn"
        subtitle="Dựa trên lựa chọn của bạn"
        fallbackHref="/assistant"
      />

      <div className="mt-4 flex items-center justify-between gap-3 px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(216,180,90,0.35)] bg-[rgba(216,180,90,0.1)] px-3 py-1.5 text-[12px] font-semibold text-gold">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Gợi ý bởi AI
        </span>
        <Link
          href="/assistant"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Làm lại
        </Link>
      </div>

      <section className="mt-4 space-y-4 px-4">
        {ranked.map((scored, index) => {
          const course = coursesById.get(scored.golfId);
          if (!course) return null;
          return (
            <RecommendationCard
              key={scored.golfId}
              rank={index + 1}
              course={course}
              scored={scored}
              recommendation={recommendations?.find((r) => r.golfId === scored.golfId)}
            />
          );
        })}
      </section>

      <DemoFooter />
    </main>
  );
}
