import { Star } from "lucide-react";

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(".", ",")}k`;
  return String(count);
}

export default function Rating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-text-secondary">
      <Star className="size-[14px] fill-gold text-gold" aria-hidden="true" />
      <span className="font-semibold text-text-main">
        {rating.toFixed(1).replace(".", ",")}
      </span>
      {reviewCount !== undefined ? (
        <span>({formatCount(reviewCount)} đánh giá)</span>
      ) : null}
    </span>
  );
}
