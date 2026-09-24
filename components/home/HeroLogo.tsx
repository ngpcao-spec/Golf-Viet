/** Logo du hero, rendu à l'identique par l'accueil et par l'intro caméra. */
export default function HeroLogo() {
  return (
    <div className="safe-top absolute inset-x-0 top-0 flex flex-col items-center px-4">
      <p className="font-[family-name:var(--font-display)] text-[26px] tracking-[0.3em] text-gold">
        VIET GOLF
      </p>
      <p className="mt-0.5 text-[10px] tracking-[0.25em] text-text-secondary">
        PLAY THE BEST IN VIETNAM
      </p>
    </div>
  );
}
