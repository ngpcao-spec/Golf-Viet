import type { CourseScoreBreakdown } from "@/types/golf";

const LABELS: Array<[keyof CourseScoreBreakdown, string]> = [
  ["courseQuality", "Chất lượng sân"],
  ["service", "Dịch vụ"],
  ["scenery", "Cảnh quan"],
  ["value", "Giá trị"],
];

export default function GolfScore({
  score,
  breakdown,
}: {
  score: number;
  breakdown: CourseScoreBreakdown;
}) {
  return (
    <section className="rounded-[16px] border border-border-gold bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[rgba(216,180,90,0.4)] bg-[rgba(216,180,90,0.08)] text-[18px] font-semibold text-gold">
          {score.toFixed(1).replace(".", ",")}
        </span>
        <div>
          <p className="text-[15px] font-semibold text-text-main">Đánh giá sân</p>
          <p className="text-[12px] text-text-secondary">
            {score.toFixed(1).replace(".", ",")} / 10 — dữ liệu demo
          </p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {LABELS.map(([key, label]) => {
          const value = breakdown[key];
          return (
            <li key={key} className="flex items-center gap-3">
              <span className="w-[104px] shrink-0 text-[12px] text-text-secondary">
                {label}
              </span>
              <span
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(245,241,232,0.08)]"
                role="img"
                aria-label={`${label}: ${value.toFixed(1)} trên 10`}
              >
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-[#D8B45A] to-[#F0D27B]"
                  style={{ width: `${Math.min(100, value * 10)}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[12px] font-semibold text-text-main">
                {value.toFixed(1).replace(".", ",")}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
