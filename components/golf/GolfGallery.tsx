"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, Heart } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";

export default function GolfGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const gallery = images.length > 0 ? images : [""];

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          if (next !== index) setIndex(next);
        }}
      >
        {gallery.map((src, i) => (
          <div key={`${src}-${i}`} className="relative w-full shrink-0 snap-center">
            <SafeImage src={src} alt={`${alt} — ảnh ${i + 1}`} priority={i === 0} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-main to-transparent" />

      <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between px-4">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/search");
          }}
          className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Chia sẻ"
            className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm"
          >
            <Share2 className="size-[18px]" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            aria-pressed={liked}
            onClick={() => setLiked((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm"
          >
            <Heart
              className={`size-[18px] ${liked ? "fill-gold text-gold" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <span className="absolute bottom-6 right-4 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        {index + 1}/{gallery.length}
      </span>
    </div>
  );
}
