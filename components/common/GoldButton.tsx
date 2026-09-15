"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost";

const base =
  "inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-5 text-[15px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  solid:
    "min-h-[52px] bg-gradient-to-b from-[#F0D27B] to-[#D8B45A] text-[#1A1206] shadow-[0_8px_24px_rgba(216,180,90,0.18)] active:from-[#e6c76f] active:to-[#c9a44e]",
  outline:
    "min-h-[48px] border border-[rgba(216,180,90,0.35)] bg-transparent text-gold active:bg-[rgba(216,180,90,0.08)]",
  ghost:
    "min-h-[44px] bg-card-elevated text-text-main active:bg-[#222a23]",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function GoldButton({
  children,
  variant = "solid",
  className = "",
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function GoldLinkButton({
  children,
  href,
  variant = "solid",
  className = "",
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
