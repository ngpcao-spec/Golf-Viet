import { Star } from "lucide-react";
import type { Review } from "@/types/golf";
import { dayMonth } from "@/lib/dates/demoDates";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="rounded-[16px] border border-border-gold bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-card-elevated text-[13px] font-semibold text-gold">
            {review.author.charAt(0)}
          </span>
          <div>
            <p className="text-[14px] font-medium text-text-main">{review.author}</p>
            <p className="text-[11px] text-text-secondary">{dayMonth(review.date)}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[13px] font-semibold text-gold">
          <Star className="size-[13px] fill-gold" aria-hidden="true" />
          {review.rating.toFixed(1).replace(".", ",")}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-text-secondary">{review.comment}</p>
    </li>
  );
}
