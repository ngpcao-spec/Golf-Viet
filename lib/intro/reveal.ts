import type { CSSProperties } from "react";

/**
 * Orchestration de l'entrée de l'accueil après l'intro caméra.
 *
 * L'état vit sur `<html data-intro>` pour atteindre aussi la barre d'onglets,
 * rendue par le layout :
 * - `playing` : l'intro joue, les éléments `.vg-reveal` attendent, masqués ;
 * - `reveal`  : ils entrent en cascade, chacun avec son propre délai ;
 * - absent    : état normal, rien n'est animé (retour sur l'accueil, etc.).
 */
export type IntroPhase = "playing" | "reveal";

/** Délai d'entrée d'un élément `.vg-reveal`, en millisecondes. */
export function revealDelay(ms: number): CSSProperties {
  return { "--vg-delay": `${ms}ms` } as CSSProperties;
}

/** Durée de la cascade complète : dernier délai + durée d'une entrée. */
export const REVEAL_TOTAL_MS = 820 + 900;

export function setIntroPhase(phase: IntroPhase | null): void {
  const root = document.documentElement;
  if (phase) root.dataset.intro = phase;
  else delete root.dataset.intro;
}
