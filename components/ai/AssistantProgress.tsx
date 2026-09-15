export default function AssistantProgress({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const percent = Math.round((step / total) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px] text-text-secondary">
        <span>
          Câu hỏi{" "}
          <span className="font-semibold text-gold">
            {step} / {total}
          </span>
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(245,241,232,0.08)]"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Tiến độ câu hỏi"
      >
        <span
          className="block h-full rounded-full bg-gradient-to-r from-[#D8B45A] to-[#F0D27B] transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
