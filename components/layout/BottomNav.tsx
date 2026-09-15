"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Tag, Sparkles, Menu, X } from "lucide-react";

const items = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/search?deals=1", label: "Ưu đãi", icon: Tag, match: "/search" },
  { href: "/assistant", label: "Trợ lý AI", icon: Sparkles },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  if (pathname.startsWith("/demo-admin")) return null;

  return (
    <>
      {moreOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="app-shell animate-fade-up safe-bottom min-h-0 rounded-t-[18px] border-t border-border-gold bg-card-elevated p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold">
                Khác
              </h2>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setMoreOpen(false)}
                className="flex size-9 items-center justify-center rounded-full border border-border-gold"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <section className="mb-4 rounded-[16px] border border-border-gold bg-card p-4">
              <h3 className="mb-1 text-[14px] font-semibold text-gold">Về Viet Golf</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Viet Golf giúp bạn tìm và đặt giờ phát bóng tại các sân golf hàng đầu
                quanh TP. Hồ Chí Minh, với trải nghiệm cao cấp trên điện thoại.
              </p>
            </section>

            <section className="rounded-[16px] border border-border-gold bg-card p-4">
              <h3 className="mb-1 text-[14px] font-semibold text-gold">Dữ liệu demo</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Giá, giờ chơi, đánh giá và thời tiết trong phiên bản này chỉ nhằm mục
                đích minh họa. Không có khoản thanh toán nào được thực hiện.
              </p>
            </section>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] border-t border-border-gold bg-bg-secondary/95 backdrop-blur-md">
        <ul className="flex items-stretch pb-[env(safe-area-inset-bottom,0px)]">
          {items.map((item) => {
            const target = "match" in item ? item.match : item.href;
            const active = pathname === target || (target !== "/" && pathname.startsWith(target));
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                    active ? "text-gold" : "text-text-secondary"
                  }`}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                moreOpen ? "text-gold" : "text-text-secondary"
              }`}
            >
              <Menu className="size-[18px]" aria-hidden="true" />
              Khác
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
