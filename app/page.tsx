"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Users,
  ChevronRight,
  Sparkles,
  Award,
  TicketPercent,
  Zap,
  ArrowRight,
} from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import SectionTitle from "@/components/common/SectionTitle";
import Badge from "@/components/common/Badge";
import OptionSheet from "@/components/common/OptionSheet";
import { GoldButton } from "@/components/common/GoldButton";
import DemoFooter from "@/components/layout/DemoFooter";
import HeroLogo from "@/components/home/HeroLogo";
import IntroSplash from "@/components/home/IntroSplash";
import { HERO_IMAGE, heroImageStyle } from "@/lib/intro/heroFraming";
import { TITLE_DELAYS_MS, revealDelay } from "@/lib/intro/reveal";
import { courses } from "@/data/courses";
import { generateTeeTimes } from "@/data/seedTeeTimes";
import { demoDates, longDateVi, mediumDateVi } from "@/lib/dates/demoDates";
import { formatVND } from "@/lib/money/formatVND";
import { useSearch } from "@/lib/useSearch";

const ARGUMENTS = [
  { icon: Award, title: "Sân golf", subtitle: "cao cấp" },
  { icon: TicketPercent, title: "Giá tốt", subtitle: "mỗi ngày" },
  { icon: Zap, title: "Đặt sân", subtitle: "nhanh chóng" },
];

export default function HomePage() {
  const router = useRouter();
  const { area, date, players, setSearch } = useSearch();
  const [sheet, setSheet] = useState<"date" | "players" | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const dateOptions = useMemo(
    () => demoDates(8).map((iso) => ({ value: iso, label: longDateVi(iso) })),
    [],
  );

  const playerOptions = useMemo(
    () => [1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n} người` })),
    [],
  );

  // Promotions calculées sur la date recherchée, à partir du dataset embarqué.
  const promos = useMemo(() => {
    return courses
      .map((course) => {
        const best = generateTeeTimes(course.id, date)
          .filter((t) => t.status === "available" && t.discountPercent > 0)
          .sort((a, b) => b.discountPercent - a.discountPercent)[0];
        return best ? { course, teeTime: best } : null;
      })
      .filter((v): v is { course: (typeof courses)[number]; teeTime: ReturnType<typeof generateTeeTimes>[number] } => v !== null)
      .sort((a, b) => b.teeTime.discountPercent - a.teeTime.discountPercent)
      .slice(0, 3);
  }, [date]);

  return (
    <main>
      <IntroSplash heroRef={heroRef} />

      <section className="relative">
        {/* Cadrage final de l'intro caméra : voir lib/intro/heroFraming.ts. */}
        <div
          ref={heroRef}
          className="relative aspect-[941/974] max-h-[45dvh] w-full overflow-hidden"
        >
          <SafeImage
            src={HERO_IMAGE.src}
            alt="Sân golf cao cấp lúc hoàng hôn"
            priority
            unoptimized
            style={heroImageStyle(HERO_IMAGE)}
          />
          {/* Voile haut pour le logo, fondu bas pour la lisibilité du titre. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-main via-bg-main/80 to-transparent" />
        </div>

        <HeroLogo />

        <div className="absolute inset-x-0 bottom-2 px-4">
          <h1
            className="vg-reveal-title font-[family-name:var(--font-display)] text-[30px] leading-[1.15] font-semibold text-text-main"
            style={revealDelay(TITLE_DELAYS_MS.title)}
          >
            Những sân golf
            <br />
            <span className="gold-text">đẳng cấp</span> đang chờ bạn
          </h1>
          <p
            className="vg-reveal-title mt-2 text-[13px] text-text-secondary"
            style={revealDelay(TITLE_DELAYS_MS.subtitle)}
          >
            Trải nghiệm khác biệt tại TP. Hồ Chí Minh
          </p>
        </div>
      </section>

      <section className="vg-reveal mt-1 px-4" style={revealDelay(450)}>
        <div className="rounded-[16px] border border-border-gold bg-card/85 p-2.5 backdrop-blur-md">
          <ul className="space-y-2">
            <li>
              <div className="flex min-h-[52px] items-center gap-3 rounded-[12px] border border-border-gold bg-card-elevated px-4">
                <MapPin className="size-[18px] shrink-0 text-gold" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-[11px] text-text-secondary">Địa điểm</span>
                  <span className="block text-[15px] font-medium">{area}</span>
                </span>
              </div>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setSheet("date")}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-[12px] border border-border-gold bg-card-elevated px-4 text-left"
              >
                <CalendarDays className="size-[18px] shrink-0 text-gold" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-[11px] text-text-secondary">Ngày chơi</span>
                  <span className="block text-[15px] font-medium">{longDateVi(date)}</span>
                </span>
                <ChevronRight className="size-4 text-text-secondary" aria-hidden="true" />
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setSheet("players")}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-[12px] border border-border-gold bg-card-elevated px-4 text-left"
              >
                <Users className="size-[18px] shrink-0 text-gold" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-[11px] text-text-secondary">Số người chơi</span>
                  <span className="block text-[15px] font-medium">{players} người</span>
                </span>
                <ChevronRight className="size-4 text-text-secondary" aria-hidden="true" />
              </button>
            </li>
          </ul>

          <div className="mt-2.5">
            <GoldButton onClick={() => router.push("/search")}>
              Tìm sân golf ngay <ArrowRight className="size-4" aria-hidden="true" />
            </GoldButton>
          </div>
        </div>
      </section>

      <section className="vg-reveal mt-5 px-4" style={revealDelay(700)}>
        <ul className="grid grid-cols-3 gap-2">
          {ARGUMENTS.map(({ icon: Icon, title, subtitle }) => (
            <li
              key={title}
              className="flex flex-col items-center gap-1.5 rounded-[16px] border border-border-gold bg-card px-2 py-3 text-center"
            >
              <Icon className="size-5 text-gold" aria-hidden="true" />
              <span className="text-[12px] font-medium leading-tight text-text-main">
                {title}
                <br />
                <span className="text-text-secondary">{subtitle}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="vg-reveal mt-6 px-4" style={revealDelay(850)}>
        <Link
          href="/assistant"
          className="block overflow-hidden rounded-[16px] border border-[rgba(216,180,90,0.3)] bg-gradient-to-br from-[#1c2119] to-[#12160f] p-4"
        >
          <span className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(216,180,90,0.35)] bg-[rgba(216,180,90,0.1)]">
              <Sparkles className="size-5 text-gold" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-[family-name:var(--font-display)] text-[19px] font-semibold">
                Tìm sân golf phù hợp với bạn
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-text-secondary">
                Trợ lý thông minh giúp bạn chọn sân golf phù hợp chỉ trong vài bước.
              </span>
            </span>
          </span>
          <span className="mt-3 flex min-h-[48px] items-center justify-center rounded-[12px] bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] text-[15px] font-semibold text-[#1A1206]">
            ✨ Tìm sân golf lý tưởng
          </span>
        </Link>
      </section>

      <section id="deals" className="vg-reveal mt-7 px-4" style={revealDelay(950)}>
        <SectionTitle
          title="Ưu đãi giờ vàng"
          action={
            <Link href="/search?deals=1" className="text-[13px] font-medium text-gold">
              Xem tất cả
            </Link>
          }
        />
        {promos.length === 0 ? (
          <p className="rounded-[16px] border border-border-gold bg-card p-4 text-[13px] text-text-secondary">
            Hôm nay chưa có ưu đãi cho ngày đã chọn.
          </p>
        ) : (
          <ul className="space-y-3">
            {promos.map(({ course, teeTime }) => (
              <li key={teeTime.id}>
                <Link
                  href={`/golf/${course.slug}/tee-times`}
                  className="flex gap-3 overflow-hidden rounded-[16px] border border-border-gold bg-card p-2.5"
                >
                  <span className="relative aspect-square w-[92px] shrink-0 overflow-hidden rounded-[12px]">
                    <SafeImage src={course.heroImage} alt={course.name} sizes="92px" />
                  </span>
                  <span className="min-w-0 flex-1 py-0.5">
                    <span className="flex items-center gap-2">
                      <Badge tone="red">-{teeTime.discountPercent}%</Badge>
                      <span className="text-[11px] text-text-secondary">
                        {mediumDateVi(date)} • {teeTime.time}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[15px] font-medium text-text-main">
                      {course.name}
                    </span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="text-[16px] font-semibold text-gold">
                        {formatVND(teeTime.price)}
                      </span>
                      {teeTime.originalPrice ? (
                        <span className="text-[12px] text-text-secondary line-through">
                          {formatVND(teeTime.originalPrice)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DemoFooter />

      <OptionSheet
        open={sheet === "date"}
        title="Chọn ngày chơi"
        options={dateOptions}
        selected={date}
        onSelect={(value) => setSearch({ date: value })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        open={sheet === "players"}
        title="Số người chơi"
        options={playerOptions}
        selected={String(players)}
        onSelect={(value) => setSearch({ players: Number(value) })}
        onClose={() => setSheet(null)}
      />
    </main>
  );
}
