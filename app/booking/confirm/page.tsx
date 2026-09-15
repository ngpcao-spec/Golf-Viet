"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MapPin, AlertCircle, ArrowRight } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import SafeImage from "@/components/common/SafeImage";
import Rating from "@/components/common/Rating";
import BookingSummary from "@/components/booking/BookingSummary";
import { GoldButton, GoldLinkButton } from "@/components/common/GoldButton";
import DemoFooter from "@/components/layout/DemoFooter";
import { useDemoStore } from "@/store/demoStore";
import { useHydrated } from "@/lib/useHydrated";
import { localDemoRepository } from "@/repositories/LocalDemoRepository";
import { applyBooking, NOT_ENOUGH_SLOTS_MESSAGE } from "@/lib/booking/applyBooking";

export default function BookingConfirmPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const pendingSelection = useDemoStore((s) => s.pendingSelection);
  const setPendingSelection = useDemoStore((s) => s.setPendingSelection);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const submittedRef = useRef(false);

  const course = pendingSelection
    ? localDemoRepository.getCourseById(pendingSelection.golfId)
    : null;
  const teeTime = pendingSelection
    ? localDemoRepository.getTeeTime(pendingSelection.teeTimeId)
    : null;

  useEffect(() => {
    // `completed` évite de renvoyer vers /search juste après une réservation
    // réussie, au moment où la sélection en attente est effacée.
    if (hydrated && !pendingSelection && !completed) router.replace("/search");
  }, [hydrated, pendingSelection, completed, router]);

  if (!hydrated) {
    return (
      <main className="safe-top px-4 py-10 text-center text-[13px] text-text-secondary">
        Đang tải thông tin đặt sân...
      </main>
    );
  }

  if (!pendingSelection || !course || !teeTime) {
    if (completed) {
      return (
        <main className="safe-top px-4 py-10 text-center text-[13px] text-text-secondary">
          Đang hoàn tất đặt sân...
        </main>
      );
    }
    return (
      <main className="safe-top flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[22px] font-semibold">
          Không tìm thấy giờ phát bóng.
        </h1>
        <p className="mt-2 text-[13px] text-text-secondary">
          Vui lòng chọn lại giờ chơi để tiếp tục.
        </p>
        <div className="mt-6 w-full max-w-[280px]">
          <GoldLinkButton href="/search">Tìm sân golf</GoldLinkButton>
        </div>
      </main>
    );
  }

  const players = pendingSelection.players;

  const confirm = () => {
    // Protection contre le double tap : un seul booking par sélection.
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);

    const fresh = localDemoRepository.getTeeTime(teeTime.id);
    if (!fresh) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(NOT_ENOUGH_SLOTS_MESSAGE);
      return;
    }

    const result = applyBooking(fresh, players);
    if (!result.ok) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(result.error);
      return;
    }

    localDemoRepository.updateTeeTime(result.updatedTeeTime);
    localDemoRepository.createBooking(result.booking);
    setCompleted(true);
    router.replace(`/booking/success/${result.booking.id}`);
    setPendingSelection(null);
  };

  return (
    <main className="pb-6">
      <AppHeader title="Xác nhận đặt sân" fallbackHref={`/golf/${course.slug}/tee-times`} />

      <section className="mt-4 px-4">
        <div className="overflow-hidden rounded-[16px] border border-border-gold bg-card">
          <div className="relative aspect-[16/9] w-full">
            <SafeImage src={course.heroImage} alt={course.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="p-4">
            <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold">
              {course.name}
            </h1>
            <div className="mt-1.5">
              <Rating rating={course.rating} reviewCount={course.reviewCount} />
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-text-secondary">
              <MapPin className="size-[14px] text-gold" aria-hidden="true" />
              {course.addressVi}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 px-4">
        <BookingSummary
          date={teeTime.date}
          time={teeTime.time}
          players={players}
          unitPrice={teeTime.price}
          originalUnitPrice={teeTime.originalPrice}
        />
      </section>

      <section className="mt-4 px-4">
        <div className="rounded-[16px] border border-border-gold bg-card p-4">
          <h2 className="mb-2 text-[14px] font-semibold text-gold">Lưu ý</h2>
          <ul className="space-y-1.5 text-[12px] leading-relaxed text-text-secondary">
            <li>• Bản demo — chưa thực hiện thanh toán.</li>
            <li>• Đây là đặt giữ chỗ minh họa, không có giao dịch thật.</li>
            <li>• Vui lòng có mặt trước giờ phát bóng 30 phút.</li>
          </ul>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mx-4 mt-4 flex items-start gap-2 rounded-[12px] border border-[rgba(232,86,79,0.4)] bg-[rgba(232,86,79,0.1)] px-3 py-2.5 text-[13px] text-promo-red"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <section className="mt-5 px-4">
        <GoldButton onClick={confirm} disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Xác nhận đặt sân"}
          {submitting ? null : <ArrowRight className="size-4" aria-hidden="true" />}
        </GoldButton>
      </section>

      <DemoFooter />
    </main>
  );
}
