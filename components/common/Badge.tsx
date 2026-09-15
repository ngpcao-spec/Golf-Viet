type Tone = "gold" | "red" | "green" | "neutral";

const tones: Record<Tone, string> = {
  gold: "border-[rgba(216,180,90,0.35)] bg-[rgba(216,180,90,0.12)] text-gold",
  red: "border-transparent bg-promo-red text-white",
  green: "border-[rgba(95,169,119,0.35)] bg-[rgba(95,169,119,0.12)] text-available-green",
  neutral: "border-[rgba(245,241,232,0.12)] bg-[rgba(245,241,232,0.06)] text-text-secondary",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-[3px] text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
