import { GoldLinkButton } from "@/components/common/GoldButton";

export default function GolfNotFound() {
  return (
    <main className="safe-top flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold">
        Không tìm thấy sân golf.
      </h1>
      <p className="mt-2 text-[13px] text-text-secondary">
        Sân golf bạn tìm không có trong phiên bản demo này.
      </p>
      <div className="mt-6 w-full max-w-[280px]">
        <GoldLinkButton href="/">Về trang chủ</GoldLinkButton>
      </div>
    </main>
  );
}
