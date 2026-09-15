"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Info, Users } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import TeeTimeCard from "@/components/golf/TeeTimeCard";
import DemoFooter from "@/components/layout/DemoFooter";
import OptionSheet from "@/components/common/OptionSheet";
import { demoDates, dayMonth, weekdayShortVi } from "@/lib/dates/demoDates";
import { useSearch } from "@/lib/useSearch";
import { useTeeTimes } from "@/lib/useTeeTimes";
import { useDemoStore } from "@/store/demoStore";
import type { GolfCourse, TeeTime } from "@/types/golf";

export default function TeeTimesClient({ course }: { course: GolfCourse }) {
  const router = useRouter();
  const { date, players, setSearch } = useSearch();
  const setPendingSelection = useDemoStore((s) => s.setPendingSelection);
  const teeTimes = useTeeTimes(course.id, date);
  const [playersSheet, setPlayersSheet] = useState(false);

  const dates = useMemo(() => demoDates(7), []);

  const select = (teeTime: TeeTime) => {
    setPendingSelection({
      golfId: course.id,
      teeTimeId: teeTime.id,
      date: teeTime.date,
      time: teeTime.time,
      players,
    });
    router.push("/booking/confirm");
  };

  return (
    <main className="pb-6">
      <AppHeader
        title="Chọn giờ phát bóng"
        subtitle={course.name}
        fallbackHref={`/golf/${course.slug}`}
      />

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {dates.map((iso) => {
          const active = iso === date;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSearch({ date: iso })}
              aria-pressed={active}
              className={`flex min-h-[58px] w-[60px] shrink-0 flex-col items-center justify-center rounded-[12px] border text-center ${
                active
                  ? "border-transparent bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] text-[#1A1206]"
                  : "border-border-gold bg-card text-text-main"
              }`}
            >
              <span className="text-[11px] font-medium">{weekdayShortVi(iso)}</span>
              <span className="text-[14px] font-semibold">{dayMonth(iso)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 px-4">
        <button
          type="button"
          onClick={() => setPlayersSheet(true)}
          className="flex min-h-[44px] w-full items-center gap-2 rounded-[12px] border border-border-gold bg-card px-4 text-left text-[13px]"
        >
          <Users className="size-4 text-gold" aria-hidden="true" />
          <span className="flex-1 text-text-secondary">Số người chơi</span>
          <span className="font-semibold text-gold">{players} người</span>
        </button>
      </div>

      <section className="mt-4 px-4">
        {teeTimes.length === 0 ? (
          <p className="rounded-[16px] border border-border-gold bg-card p-5 text-center text-[13px] text-text-secondary">
            Chưa có giờ phát bóng cho ngày này.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {teeTimes.map((teeTime) => (
              <TeeTimeCard
                key={teeTime.id}
                teeTime={teeTime}
                players={players}
                onSelect={select}
              />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 flex items-start gap-2 px-4 text-[11px] leading-relaxed text-text-secondary">
        <Info className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden="true" />
        Giá hiển thị là giá cho 1 người chơi, đã bao gồm phí sân và phí dịch vụ. Bản demo —
        chưa thực hiện thanh toán.
      </p>

      <DemoFooter />

      <OptionSheet
        open={playersSheet}
        title="Số người chơi"
        options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n} người` }))}
        selected={String(players)}
        onSelect={(value) => setSearch({ players: Number(value) })}
        onClose={() => setPlayersSheet(false)}
      />
    </main>
  );
}
