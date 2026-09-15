"use client";

import { Check, CalendarDays, Clock, Users, Ticket, MapPin } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { GoldLinkButton } from "@/components/common/GoldButton";
import DemoFooter from "@/components/layout/DemoFooter";
import { useHydrated } from "@/lib/useHydrated";
import { useDemoStore } from "@/store/demoStore";
import { localDemoRepository } from "@/repositories/LocalDemoRepository";
import { formatVND } from "@/lib/money/formatVND";
import { longDateVi } from "@/lib/dates/demoDates";

export default function SuccessClient({ bookingId }: { bookingId: string }) {
  const hydrated = useHydrated();
  const booking = useDemoStore((s) => s.bookings[bookingId]);
  const course = booking ? localDemoRepository.getCourseById(booking.golfId) : null;

  if (!hydrated) {
    return (
      <main className="safe-top px-4 py-10 text-center text-[13px] text-text-secondary">
        Đang tải thông tin đặt sân...
      </main>
    );
  }

  if (!booking || !course) {
    return (
      <main className="safe-top flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[22px] font-semibold">
          Không tìm thấy mã đặt sân.
        </h1>
        <p className="mt-2 text-[13px] text-text-secondary">
          Đặt sân demo chỉ được lưu trên chính thiết bị đã thực hiện.
        </p>
        <div className="mt-6 w-full max-w-[280px]">
          <GoldLinkButton href="/">Về trang chủ</GoldLinkButton>
        </div>
      </main>
    );
  }

  const rows = [
    { icon: CalendarDays, label: "Ngày chơi", value: longDateVi(booking.date) },
    { icon: Clock, label: "Giờ phát bóng", value: booking.time },
    { icon: Users, label: "Số người chơi", value: `${booking.players} người` },
  ];

  return (
    <main className="safe-top pb-6">
      <section className="flex flex-col items-center px-6 pt-8 text-center">
        <span className="flex size-20 items-center justify-center rounded-full border-2 border-gold bg-[rgba(216,180,90,0.08)]">
          <Check className="size-9 text-gold" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[27px] font-semibold">
          Đặt sân thành công!
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          Cảm ơn bạn đã chọn Viet Golf.
          <br />
          Hẹn gặp bạn trên sân!
        </p>
      </section>

      <section className="mt-6 px-4">
        <div className="flex items-center gap-3 rounded-[16px] border border-[rgba(216,180,90,0.35)] bg-[rgba(216,180,90,0.08)] p-4">
          <Ticket className="size-6 shrink-0 text-gold" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[11px] text-text-secondary">Mã đặt sân</p>
            <p className="text-[18px] font-semibold tracking-wide text-gold">{booking.id}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="overflow-hidden rounded-[16px] border border-border-gold bg-card">
          <div className="flex gap-3 p-3">
            <span className="relative aspect-square w-[76px] shrink-0 overflow-hidden rounded-[12px]">
              <SafeImage src={course.heroImage} alt={course.name} sizes="76px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-text-main">
                {course.name}
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[12px] text-text-secondary">
                <MapPin className="size-3.5 text-gold" aria-hidden="true" />
                {course.addressVi}
              </span>
            </span>
          </div>

          <ul className="space-y-3 border-t border-border-gold p-4">
            {rows.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="flex-1 text-[13px] text-text-secondary">{label}</span>
                <span className="text-[13px] font-medium text-text-main">{value}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between border-t border-border-gold pt-3">
              <span className="text-[14px] text-text-secondary">Tổng cộng</span>
              <span className="text-[20px] font-semibold text-gold">
                {formatVND(booking.totalPrice)}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <p className="mx-4 mt-4 rounded-[12px] border border-border-gold bg-card px-3 py-2.5 text-center text-[12px] leading-relaxed text-text-secondary">
        Bản demo — không có khoản thanh toán nào được thực hiện.
      </p>

      <section className="mt-5 px-4">
        <GoldLinkButton href="/">Về trang chủ</GoldLinkButton>
      </section>

      <p className="mt-8 text-center font-[family-name:var(--font-display)] text-[20px] italic text-gold/80">
        More than a game
        <br />A better life
      </p>

      <DemoFooter />
    </main>
  );
}
