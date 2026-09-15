export default function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-[family-name:var(--font-display)] text-[22px] leading-tight font-semibold text-text-main">
        {title}
      </h2>
      {action}
    </div>
  );
}
