"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import GolfCard from "@/components/golf/GolfCard";
import DemoFooter from "@/components/layout/DemoFooter";
import { courses } from "@/data/courses";
import { useSearch } from "@/lib/useSearch";
import { useDemoStore } from "@/store/demoStore";
import { mergeTeeTimes } from "@/repositories/LocalDemoRepository";
import { mediumDateVi } from "@/lib/dates/demoDates";
import type { TeeTime } from "@/types/golf";

type Filter = "all" | "deals" | "nearest" | "cheapest";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "deals", label: "Ưu đãi hot" },
  { value: "nearest", label: "Gần nhất" },
  { value: "cheapest", label: "Giá tốt" },
];

export default function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { date, players, area } = useSearch();
  const setPendingSelection = useDemoStore((s) => s.setPendingSelection);
  const overrides = useDemoStore((s) => s.teeTimeOverrides);
  const deleted = useDemoStore((s) => s.deletedTeeTimeIds);

  const [filter, setFilter] = useState<Filter>(params.get("deals") === "1" ? "deals" : "all");

  const results = useMemo(() => {
    const rows = courses.map((course) => {
      const teeTimes = mergeTeeTimes(course.id, date, overrides, deleted);
      const available = teeTimes.filter(
        (t) => t.status === "available" && t.remainingSlots >= players,
      );
      const cheapest = available.reduce(
        (min, t) => Math.min(min, t.price),
        Number.POSITIVE_INFINITY,
      );
      return {
        course,
        teeTimes: available,
        cheapest: Number.isFinite(cheapest) ? cheapest : course.basePrice,
        bestDiscount: available.reduce((max, t) => Math.max(max, t.discountPercent), 0),
      };
    });

    const filtered = filter === "deals" ? rows.filter((r) => r.bestDiscount > 0) : rows;

    const sorted = [...filtered];
    if (filter === "nearest") sorted.sort((a, b) => a.course.distanceKm - b.course.distanceKm);
    else if (filter === "cheapest") sorted.sort((a, b) => a.cheapest - b.cheapest);
    else if (filter === "deals") sorted.sort((a, b) => b.bestDiscount - a.bestDiscount);
    else sorted.sort((a, b) => b.course.rating - a.course.rating);

    return sorted;
  }, [date, players, filter, overrides, deleted]);

  const selectTeeTime = (teeTime: TeeTime) => {
    setPendingSelection({
      golfId: teeTime.golfId,
      teeTimeId: teeTime.id,
      date: teeTime.date,
      time: teeTime.time,
      players,
    });
    router.push("/booking/confirm");
  };

  return (
    <main>
      <AppHeader
        title="Kết quả tìm kiếm"
        subtitle={`${area} • ${mediumDateVi(date)} • ${players} người`}
        action={
          <span
            className="flex size-10 items-center justify-center rounded-full border border-border-gold bg-card text-gold"
            aria-hidden="true"
          >
            <SlidersHorizontal className="size-4" />
          </span>
        }
      />

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((item) => {
          const active = item.value === filter;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={active}
              className={`min-h-[36px] shrink-0 rounded-full border px-4 text-[13px] font-medium ${
                active
                  ? "border-[rgba(216,180,90,0.5)] bg-[rgba(216,180,90,0.12)] text-gold"
                  : "border-border-gold bg-card text-text-secondary"
              }`}
            >
              {item.value === "all" ? `Tất cả (${courses.length})` : item.label}
            </button>
          );
        })}
      </div>

      <section className="mt-4 space-y-4 px-4">
        {results.length === 0 ? (
          <p className="rounded-[16px] border border-border-gold bg-card p-5 text-center text-[13px] text-text-secondary">
            Không tìm thấy sân golf phù hợp với bộ lọc này.
          </p>
        ) : (
          results.map(({ course, teeTimes }) => (
            <GolfCard
              key={course.id}
              course={course}
              teeTimes={teeTimes}
              onSelectTeeTime={selectTeeTime}
            />
          ))
        )}
      </section>

      <DemoFooter />
    </main>
  );
}
