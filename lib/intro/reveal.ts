import type { CSSProperties } from "react";

/**
 * Orchestration de l'entrée de l'accueil, synchronisée sur l'intro caméra.
 *
 * L'état vit sur `<html data-intro>` pour atteindre aussi la barre d'onglets,
 * rendue par le layout :
 * - `playing` : la caméra avance, les éléments `.vg-reveal` attendent, masqués ;
 * - `reveal`  : ils entrent en cascade PAR-DESSUS l'intro qui se poursuit,
 *               chacun avec son propre délai, et se posent avec la caméra ;
 * - absent    : état normal, rien n'est animé (retour sur l'accueil, etc.).
 */
export type IntroPhase = "playing" | "reveal";

/** Durée d'entrée d'un élément — doit rester égale à celle de `vg-reveal` (globals.css). */
export const REVEAL_DURATION_MS = 1100;
/** Plus grand délai utilisé dans la cascade de l'accueil. */
export const REVEAL_LAST_DELAY_MS = 950;
/** Durée de la cascade complète, depuis son déclenchement. */
export const REVEAL_TOTAL_MS = REVEAL_LAST_DELAY_MS + REVEAL_DURATION_MS;

/** Délai d'entrée d'un élément `.vg-reveal`, en millisecondes. */
export function revealDelay(ms: number): CSSProperties {
  return { "--vg-delay": `${ms}ms` } as CSSProperties;
}

export function getIntroPhase(): string | undefined {
  return document.documentElement.dataset.intro;
}

export function setIntroPhase(phase: IntroPhase | null): void {
  const root = document.documentElement;
  if (phase) root.dataset.intro = phase;
  else delete root.dataset.intro;
}

/**
 * Tant que l'overlay d'intro est à l'écran, les éléments de l'accueil restent
 * au-dessus de lui (`<html data-intro-overlay>`), indépendamment de la cascade
 * qui peut se terminer juste avant la bascule finale.
 */
export function setIntroOverlay(onScreen: boolean): void {
  const root = document.documentElement;
  if (onScreen) root.dataset.introOverlay = "";
  else delete root.dataset.introOverlay;
}

/**
 * Le nom, le slogan et le titre du hero ont leur propre signal : ils n'entrent
 * qu'à la fin de l'intro, quand la caméra se pose ou quand l'utilisateur coupe
 * l'intro (`<html data-intro-title>` : `hidden`, puis `reveal`, puis absent).
 */
export type TitlePhase = "hidden" | "reveal";

/** Entrée de haut en bas : nom, slogan, titre, sous-titre. */
export const TITLE_DELAYS_MS = {
  brand: 0,
  slogan: 150,
  title: 250,
  subtitle: 450,
} as const;

export function setTitlePhase(phase: TitlePhase | null): void {
  const root = document.documentElement;
  if (phase) root.dataset.introTitle = phase;
  else delete root.dataset.introTitle;
}

export function getTitlePhase(): string | undefined {
  return document.documentElement.dataset.introTitle;
}

let titleTimer: number | undefined;

/** Fait entrer nom, slogan et titre ; indépendant de l'overlay, comme la cascade. */
export function startTitleReveal(): void {
  setTitlePhase("reveal");
  window.clearTimeout(titleTimer);
  titleTimer = window.setTimeout(
    () => setTitlePhase(null),
    TITLE_DELAYS_MS.subtitle + REVEAL_DURATION_MS,
  );
}

let revealTimer: number | undefined;

/**
 * Lance la cascade. Elle vit indépendamment de l'overlay d'intro : la fin de
 * l'intro ne doit jamais l'interrompre ni la faire sauter à l'état final.
 */
export function startReveal(): void {
  setIntroPhase("reveal");
  window.clearTimeout(revealTimer);
  revealTimer = window.setTimeout(() => setIntroPhase(null), REVEAL_TOTAL_MS);
}
