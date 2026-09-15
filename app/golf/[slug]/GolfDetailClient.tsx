"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MapPin, Flag, Target, Sprout, UtensilsCrossed, ArrowRight } from "lucide-react";
import GolfGallery from "@/components/golf/GolfGallery";
import GolfScore from "@/components/golf/GolfScore";
import ReviewCard from "@/components/golf/ReviewCard";
import WeatherCard from "@/components/golf/WeatherCard";
import MapCard from "@/components/golf/MapCard";
import Rating from "@/components/common/Rating";
import SectionTitle from "@/components/common/SectionTitle";
import Badge from "@/components/common/Badge";
import DemoFooter from "@/components/layout/DemoFooter";
import { formatVND } from "@/lib/money/formatVND";
import { useSearch } from "@/lib/useSearch";
import { useTeeTimes } from "@/lib/useTeeTimes";
import type { GolfCourse } from "@/types/golf";

const DIFFICULTY_LABELS: Record<GolfCourse["difficulty"], string> = {
  easy: "Dễ chơi",
  medium: "Trung bình",
  hard: "Thử thách cao",
  championship: "Đẳng cấp thi đấu",
};

export default function GolfDetailClient({ course }: { course: GolfCourse }) {
  const { date } = useSearch();
  const teeTimes = useTeeTimes(course.id, date);

  const cheapest = useMemo(() => {
    const available = teeTimes.filter((t) => t.status === "available");
    const min = available.reduce((acc, t) => Math.min(acc, t.price), Number.POSITIVE_INFINITY);
    return Number.isFinite(min) ? min : course.basePrice;
  }, [teeTimes, course.basePrice]);

  const infoCards = [
    { icon: Flag, title: `${course.holes} hố`, subtitle: `Par ${course.par}` },
    { icon: Target, title: "Thử thách", subtitle: DIFFICULTY_LABELS[course.difficulty] },
    { icon: Sprout, title: "Mặt cỏ", subtitle: course.grass },
    {
      icon: UtensilsCrossed,
      title: "Tiện ích",
      subtitle: course.amenities.slice(0, 2).join(" • "),
    },
  ];

  return (
    <main className="pb-24">
      <GolfGallery images={course.gallery} alt={course.name} />

      <section className="-mt-4 px-4">
        <h1 className="font-[family-name:var(--font-display)] text-[25px] leading-tight font-semibold">
          {course.name}
        </h1>
        <div className="mt-2">
          <Rating rating={course.rating} reviewCount={course.reviewCount} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-text-secondary">
          <MapPin className="size-[14px] text-gold" aria-hidden="true" />
          {course.addressVi} • {course.distanceKm} km
        </p>
      </section>

      <section className="mt-4 px-4">
        <ul className="grid grid-cols-4 gap-2">
          {infoCards.map(({ icon: Icon, title, subtitle }) => (
            <li
              key={title}
              className="flex flex-col items-center gap-1 rounded-[12px] border border-border-gold bg-card px-1.5 py-2.5 text-center"
            >
              <Icon className="size-[18px] text-gold" aria-hidden="true" />
              <span className="text-[11px] font-semibold leading-tight text-text-main">
                {title}
              </span>
              <span className="text-[10px] leading-tight text-text-secondary">{subtitle}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 px-4">
        <SectionTitle title="Tổng quan" />
        <p className="text-[13px] leading-relaxed text-text-secondary">
          {course.descriptionVi}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {course.amenities.map((amenity) => (
            <li key={amenity}>
              <Badge>{amenity}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 px-4">
        <SectionTitle title="Giờ chơi" />
        <div className="rounded-[16px] border border-border-gold bg-card p-4">
          <p className="text-[13px] text-text-secondary">
            Còn{" "}
            <span className="font-semibold text-gold">
              {teeTimes.filter((t) => t.status === "available").length} giờ trống
            </span>{" "}
            cho ngày đã chọn.
          </p>
          <Link
            href={`/golf/${course.slug}/tee-times`}
            className="mt-3 flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-[rgba(216,180,90,0.35)] text-[14px] font-semibold text-gold"
          >
            Xem tất cả giờ phát bóng
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mt-6 px-4">
        <SectionTitle title="Đánh giá" />
        <GolfScore score={course.courseScore} breakdown={course.scoreBreakdown} />
        <ul className="mt-3 space-y-3">
          {course.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      </section>

      <section className="mt-6 px-4">
        <SectionTitle title="Bản đồ" />
        <MapCard
          latitude={course.latitude}
          longitude={course.longitude}
          addressVi={course.addressVi}
          distanceKm={course.distanceKm}
          name={course.name}
        />
      </section>

      <section className="mt-6 px-4">
        <SectionTitle title="Thời tiết" />
        <WeatherCard weather={course.weatherDemo} />
      </section>

      <DemoFooter />

      <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto w-full max-w-[480px] border-t border-border-gold bg-bg-secondary/95 px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-text-secondary">Giá từ</p>
            <p className="text-[18px] font-semibold text-gold">{formatVND(cheapest)}</p>
          </div>
          <Link
            href={`/golf/${course.slug}/tee-times`}
            className="flex min-h-[52px] flex-[1.3] items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] px-4 text-[15px] font-semibold text-[#1A1206]"
          >
            Xem giờ phát bóng
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
