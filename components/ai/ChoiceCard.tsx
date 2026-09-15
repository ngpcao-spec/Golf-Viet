"use client";

import { Check } from "lucide-react";

export default function ChoiceCard({
  label,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-[16px] border px-4 text-left text-[15px] font-medium transition-colors duration-200 ${
        selected
          ? "border-[rgba(216,180,90,0.55)] bg-[rgba(216,180,90,0.12)] text-gold"
          : "border-border-gold bg-card text-text-main active:bg-card-elevated"
      }`}
    >
      <span>{label}</span>
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-gold bg-gold text-[#1A1206]" : "border-[rgba(245,241,232,0.18)]"
        }`}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3.5" /> : null}
      </span>
    </button>
  );
}
