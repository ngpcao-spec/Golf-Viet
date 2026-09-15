"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import Rating from "@/components/common/Rating";
import Badge from "@/components/common/Badge";
import { formatVND } from "@/lib/money/formatVND";
import type { GolfCourse, TeeTime } from "@/types/golf";

export default function GolfCard({
  course,
  teeTimes,
  onSelectTeeTime,
}: {
  course: GolfCourse;
  teeTimes: TeeTime[];
  onSelectTeeTime: (teeTime: TeeTime) => void;
}) {
  const available = teeTimes.filter((t) => t.status === "available");
  const preview = available.slice(0, 3);
  // Prix et prix barré proviennent toujours du même créneau : le moins cher.
  const cheapest = available.reduce<(typeof available)[number] | null>(
    (best, t) => (best === null || t.price < best.price ? t : best),
    null,
  );
  const price = cheapest?.price ?? course.basePrice;
  const original = cheapest?.originalPrice ?? null;
  const bestDiscount = available.reduce((max, t) => Math.max(max, t.discountPercent), 0);

  return (
    <article className="overflow-hidden rounded-[16px] border border-border-gold bg-card">
      <Link href={`/golf/${course.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full">
          <SafeImage src={course.heroImage} alt={course.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {bestDiscount > 0 ? (
            <div className="absolute left-0 top-3">
              <Badge tone="red" className="rounded-l-none rounded-r-md px-3 py-1 text-[11px]">
                Ưu đãi hot -{bestDiscount}%
              </Badge>
            </div>
          ) : null}
        </div>

        <div className="px-4 pt-3">
          <h3 className="font-[family-name:var(--font-display)] text-[19px] leading-tight font-semibold text-text-main">
            {course.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating rating={course.rating} reviewCount={course.reviewCount} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-text-secondary">
            <MapPin className="size-[14px] text-gold" aria-hidden="true" />
            {course.area} • {course.distanceKm} km
          </p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-[19px] font-semibold text-gold">{formatVND(price)}</span>
            {original && original > price ? (
              <span className="text-[13px] text-text-secondary line-through">
                {formatVND(original)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-3">
        {preview.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2">
            {preview.map((teeTime) => (
              <li key={teeTime.id}>
                <button
                  type="button"
                  onClick={() => onSelectTeeTime(teeTime)}
                  className="flex min-h-[48px] w-full flex-col items-center justify-center rounded-[12px] border border-border-gold bg-card-elevated px-1 py-1.5 transition-colors active:bg-[rgba(216,180,90,0.1)]"
                >
                  <span className="text-[14px] font-semibold text-text-main">
                    {teeTime.time}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    Còn {teeTime.remainingSlots} slot
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-text-secondary">Hết giờ trống cho ngày này.</p>
        )}
      </div>
    </article>
  );
}
