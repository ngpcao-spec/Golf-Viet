"use client";

import Link from "next/link";
import { Check, Clock } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import Rating from "@/components/common/Rating";
import { formatVND } from "@/lib/money/formatVND";
import type { AiRecommendation, ScoredCourse } from "@/types/assistant";
import type { GolfCourse } from "@/types/golf";

export default function RecommendationCard({
  rank,
  course,
  scored,
  recommendation,
}: {
  rank: number;
  course: GolfCourse;
  scored: ScoredCourse;
  recommendation: AiRecommendation | undefined;
}) {
  return (
    <article className="overflow-hidden rounded-[16px] border border-border-gold bg-card">
      <div className="relative aspect-[16/9] w-full">
        <SafeImage src={course.heroImage} alt={course.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] px-3 py-1 text-[12px] font-bold text-[#1A1206]">
          #{rank}
        </span>
        <span className="absolute right-3 top-3 rounded-full border border-[rgba(216,180,90,0.4)] bg-black/55 px-3 py-1 text-[12px] font-semibold text-gold backdrop-blur-sm">
          {scored.matchPercent}% phù hợp
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-[family-name:var(--font-display)] text-[19px] leading-tight font-semibold">
          {course.name}
        </h3>
        <div className="mt-1.5">
          <Rating rating={course.rating} reviewCount={course.reviewCount} />
        </div>

        {recommendation ? (
          <>
            <p className="mt-2 text-[13px] font-semibold text-gold">
              {recommendation.headline}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
              {recommendation.reason}
            </p>
            {recommendation.highlights.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {recommendation.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-center gap-1.5 rounded-md border border-border-gold bg-card-elevated px-2 py-1 text-[11px] text-text-secondary"
                  >
                    <Check className="size-3 text-available-green" aria-hidden="true" />
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-gold pt-3">
          <p className="text-[13px] text-text-secondary">
            Từ{" "}
            <span className="text-[15px] font-semibold text-gold">
              {formatVND(scored.cheapestPrice)}
            </span>
          </p>
          {scored.earliestTime ? (
            <p className="flex items-center gap-1.5 text-[12px] text-text-secondary">
              <Clock className="size-3.5 text-gold" aria-hidden="true" />
              Giờ gần nhất: {scored.earliestTime}
            </p>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={`/golf/${course.slug}/tee-times`}
            className="flex min-h-[48px] items-center justify-center rounded-[12px] bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] px-3 text-center text-[14px] font-semibold text-[#1A1206]"
          >
            Xem giờ phát bóng
          </Link>
          <Link
            href={`/golf/${course.slug}`}
            className="flex min-h-[48px] items-center justify-center rounded-[12px] border border-[rgba(216,180,90,0.35)] px-3 text-center text-[14px] font-semibold text-gold"
          >
            Xem sân golf
          </Link>
        </div>
      </div>
    </article>
  );
}
