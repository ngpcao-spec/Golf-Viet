import { CalendarDays, Clock, Users, Tag } from "lucide-react";
import { formatVND } from "@/lib/money/formatVND";
import { longDateVi } from "@/lib/dates/demoDates";

export default function BookingSummary({
  date,
  time,
  players,
  unitPrice,
  originalUnitPrice,
}: {
  date: string;
  time: string;
  players: number;
  unitPrice: number;
  originalUnitPrice?: number | null;
}) {
  const total = unitPrice * players;
  const originalTotal = originalUnitPrice ? originalUnitPrice * players : null;
  const saving = originalTotal && originalTotal > total ? originalTotal - total : 0;

  const rows = [
    { icon: CalendarDays, label: "Ngày chơi", value: longDateVi(date) },
    { icon: Clock, label: "Giờ phát bóng", value: time },
    { icon: Users, label: "Số người chơi", value: `${players} người` },
    { icon: Tag, label: "Đơn giá", value: `${formatVND(unitPrice)} / người` },
  ];

  return (
    <section className="rounded-[16px] border border-border-gold bg-card p-4">
      <h2 className="mb-3 text-[15px] font-semibold text-text-main">Thông tin đặt sân</h2>
      <ul className="space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
            <span className="flex-1 text-[13px] text-text-secondary">{label}</span>
            <span className="text-[13px] font-medium text-text-main">{value}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-baseline justify-between border-t border-border-gold pt-3">
        <span className="text-[14px] text-text-secondary">Tạm tính</span>
        <span className="flex items-baseline gap-2">
          {originalTotal && originalTotal > total ? (
            <span className="text-[13px] text-text-secondary line-through">
              {formatVND(originalTotal)}
            </span>
          ) : null}
          <span className="text-[20px] font-semibold text-gold">{formatVND(total)}</span>
        </span>
      </div>

      {saving > 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-[12px] border border-[rgba(216,180,90,0.3)] bg-[rgba(216,180,90,0.08)] px-3 py-2.5 text-[13px]">
          <Tag className="size-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="text-text-secondary">Bạn tiết kiệm được</span>
          <span className="ml-auto font-semibold text-promo-red">{formatVND(saving)}</span>
        </p>
      ) : null}
    </section>
  );
}
