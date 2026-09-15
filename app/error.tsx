"use client";

import { GoldButton, GoldLinkButton } from "@/components/common/GoldButton";

/** Aucune stack trace n'est montrée à l'utilisateur : message vietnamien simple. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="safe-top flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold">
        Đã có lỗi xảy ra.
      </h1>
      <p className="mt-2 text-[13px] text-text-secondary">
        Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      <div className="mt-6 w-full max-w-[280px] space-y-2">
        <GoldButton onClick={reset}>Thử lại</GoldButton>
        <GoldLinkButton href="/" variant="outline">
          Về trang chủ
        </GoldLinkButton>
      </div>
    </main>
  );
}
