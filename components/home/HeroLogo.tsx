import { TITLE_DELAYS_MS, revealDelay } from "@/lib/intro/reveal";

/** Nom et slogan du hero ; n'entrent qu'à la fin de l'intro caméra. */
export default function HeroLogo() {
  return (
    <div className="safe-top absolute inset-x-0 top-0 flex flex-col items-center px-4">
      <p
        className="vg-reveal-title font-[family-name:var(--font-display)] text-[26px] tracking-[0.3em] text-gold"
        style={revealDelay(TITLE_DELAYS_MS.brand)}
      >
        VIET GOLF
      </p>
      <p
        className="vg-reveal-title mt-0.5 text-[10px] tracking-[0.25em] text-text-secondary"
        style={revealDelay(TITLE_DELAYS_MS.slogan)}
      >
        PLAY THE BEST IN VIETNAM
      </p>
    </div>
  );
}
