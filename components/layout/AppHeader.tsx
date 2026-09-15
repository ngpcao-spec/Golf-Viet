"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function AppHeader({
  title,
  subtitle,
  action,
  fallbackHref = "/",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  fallbackHref?: string;
}) {
  const router = useRouter();

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-border-gold bg-bg-main/92 px-4 pb-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push(fallbackHref);
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-gold bg-card text-text-main"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[15px] font-semibold text-text-main">{title}</p>
          {subtitle ? (
            <p className="truncate text-[12px] text-text-secondary">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center">{action}</div>
      </div>
    </header>
  );
}
