"use client";

import { Check, X } from "lucide-react";

export type SheetOption = {
  value: string;
  label: string;
  hint?: string;
};

export default function OptionSheet({
  open,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  options: SheetOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="app-shell animate-fade-up safe-bottom max-h-[78dvh] min-h-0 overflow-y-auto rounded-t-[18px] border-t border-border-gold bg-card-elevated p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-border-gold"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <ul className="space-y-2">
          {options.map((option) => {
            const active = option.value === selected;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  aria-pressed={active}
                  className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[12px] border px-4 text-left ${
                    active
                      ? "border-[rgba(216,180,90,0.5)] bg-[rgba(216,180,90,0.1)] text-gold"
                      : "border-border-gold bg-card text-text-main"
                  }`}
                >
                  <span>
                    <span className="block text-[15px] font-medium">{option.label}</span>
                    {option.hint ? (
                      <span className="block text-[12px] text-text-secondary">
                        {option.hint}
                      </span>
                    ) : null}
                  </span>
                  {active ? <Check className="size-4 shrink-0" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
