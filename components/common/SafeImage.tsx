"use client";

import Image from "next/image";
import { useState } from "react";

/** `next/image` avec repli visuel dégradé : aucune image cassée dans la démo. */
export default function SafeImage({
  src,
  alt,
  fill = true,
  sizes = "(max-width: 520px) 100vw, 480px",
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-[radial-gradient(120%_90%_at_20%_0%,#2a3a2a_0%,#161d15_45%,#0b0f0c_100%)] ${
          fill ? "absolute inset-0" : "size-full"
        } ${className}`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,rgba(216,180,90,0.10)_50%,transparent_62%)]" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
