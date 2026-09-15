import { formatVND } from "@/lib/money/formatVND";

export default function Price({
  value,
  original,
  size = "md",
}: {
  value: number;
  original?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-[14px]",
    md: "text-[17px]",
    lg: "text-[20px]",
  } as const;

  return (
    <span className="flex items-baseline gap-2">
      <span className={`${sizes[size]} font-semibold text-gold`}>{formatVND(value)}</span>
      {original && original > value ? (
        <span className="text-[13px] text-text-secondary line-through">
          {formatVND(original)}
        </span>
      ) : null}
    </span>
  );
}
