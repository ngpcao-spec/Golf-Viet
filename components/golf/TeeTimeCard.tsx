"use client";

import Badge from "@/components/common/Badge";
import { formatVND } from "@/lib/money/formatVND";
import type { TeeTime } from "@/types/golf";

export default function TeeTimeCard({
  teeTime,
  players,
  onSelect,
}: {
  teeTime: TeeTime;
  players: number;
  onSelect: (teeTime: TeeTime) => void;
}) {
  const isFull = teeTime.status === "full" || teeTime.remainingSlots === 0;
  const notEnough = !isFull && teeTime.remainingSlots < players;
  const disabled = isFull || notEnough;

  return (
    <li
      className={`flex items-center gap-3 rounded-[16px] border border-border-gold bg-card px-3.5 py-3 ${
        disabled ? "opacity-55" : ""
      }`}
    >
      <div className="w-[62px] shrink-0">
        <p className="text-[17px] font-semibold text-text-main">{teeTime.time}</p>
        <p
          className={`text-[11px] ${
            isFull
              ? "text-promo-red"
              : teeTime.remainingSlots <= 1
                ? "text-gold"
                : "text-text-secondary"
          }`}
        >
          {isFull ? "Hết chỗ" : `Còn ${teeTime.remainingSlots} chỗ`}
        </p>
      </div>

      <div className="min-w-0 flex-1 text-right">
        {teeTime.discountPercent > 0 ? (
          <div className="mb-0.5 flex items-center justify-end gap-2">
            <Badge tone="red">-{teeTime.discountPercent}%</Badge>
            {teeTime.originalPrice ? (
              <span className="text-[12px] text-text-secondary line-through">
                {formatVND(teeTime.originalPrice)}
              </span>
            ) : null}
          </div>
        ) : null}
        <p className="text-[16px] font-semibold text-gold">{formatVND(teeTime.price)}</p>
        {notEnough ? (
          <p className="text-[11px] text-promo-red">Không đủ chỗ cho {players} người</p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(teeTime)}
        className="min-h-[44px] shrink-0 rounded-[12px] bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] px-4 text-[14px] font-semibold text-[#1A1206] disabled:bg-none disabled:bg-card-elevated disabled:text-text-secondary"
      >
        {isFull ? "Hết" : "Chọn"}
      </button>
    </li>
  );
}
