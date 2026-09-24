"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import HeroLogo from "@/components/home/HeroLogo";
import { HERO_IMAGE, heroMapping, introEndTransform } from "@/lib/intro/heroFraming";
import { REVEAL_TOTAL_MS, setIntroPhase } from "@/lib/intro/reveal";

/**
 * Chronologie : apparition de la photo, longue poussée caméra qui se pose en
 * douceur, puis l'accueil se construit en cascade (voir lib/intro/reveal.ts).
 */
const PHOTO_FADE_IN_MS = 900;
const PUSH_MS = 2800;
/** Départ doux, longue glissade, atterrissage très progressif. */
const PUSH_EASING = "cubic-bezier(0.32, 0, 0.08, 1)";
/** En fin de poussée, intro et accueil sont identiques : bascule quasi instantanée. */
const SWAP_MS = 220;
const SKIP_FADE_MS = 300;
/** Délai maximal d'attente de la photo avant de renoncer à l'intro. */
const IMAGE_TIMEOUT_MS = 900;
/** Au-delà, la page a trop tardé à s'hydrater : on n'impose pas l'intro. */
const LATE_START_MS = 2200;

/**
 * Vrai après la première lecture : l'intro se joue à chaque lancement de
 * l'application, pas lors d'un retour à l'accueil pendant la navigation.
 */
let introPlayed = false;

/**
 * Intro « caméra qui avance ». La photo large apparaît entière, puis la caméra
 * pousse jusqu'au cadrage exact du hero. Pendant la poussée, un voile monte
 * avec elle et prend la forme exacte du fondu bas du hero : en fin de course,
 * l'intro est identique à l'accueil au pixel près. L'overlay disparaît alors
 * sans saut et les éléments de l'accueil entrent en cascade.
 */
export default function IntroSplash({
  heroRef,
}: {
  heroRef: RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(() => !introPlayed);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const veilFadeRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<((fadeMs: number) => void) | null>(null);

  useEffect(() => {
    if (!visible) return;
    introPlayed = true;

    const overlay = overlayRef.current;
    const stage = stageRef.current;
    const photo = photoRef.current;
    const veil = veilRef.current;
    const veilFade = veilFadeRef.current;
    const hero = heroRef.current;
    const img = photo?.querySelector("img");
    if (!overlay || !stage || !photo || !veil || !veilFade || !hero || !img) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || performance.now() > LATE_START_MS) {
      const frame = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(frame);
    }

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    // L'accueil attend, masqué, sous l'intro.
    setIntroPhase("playing");

    const animations: Animation[] = [];
    let revealTimer: number | undefined;
    let closed = false;
    let cancelled = false;

    const close = (fadeMs: number) => {
      if (closed) return;
      closed = true;
      // La cascade démarre avec la bascule : aucun temps mort.
      setIntroPhase("reveal");
      revealTimer = window.setTimeout(() => setIntroPhase(null), REVEAL_TOTAL_MS);

      const from = getComputedStyle(overlay).opacity;
      const fade = overlay.animate([{ opacity: from }, { opacity: 0 }], {
        duration: fadeMs,
        easing: "ease-out",
        fill: "forwards",
      });
      animations.push(fade);
      fade.onfinish = () => {
        html.style.overflow = previousOverflow;
        setVisible(false);
      };
    };
    closeRef.current = close;

    const play = () => {
      if (cancelled || closed) return;
      window.clearTimeout(imageTimer);

      const stageBox = stage.getBoundingClientRect();
      const relative = (box: DOMRect) => ({
        x: box.left - stageBox.left,
        y: box.top - stageBox.top,
        width: box.width,
        height: box.height,
      });
      const start = relative(photo.getBoundingClientRect());
      const heroBox = relative(hero.getBoundingClientRect());

      const end = heroMapping(heroBox, HERO_IMAGE.size, HERO_IMAGE);
      const move = introEndTransform(start, end, HERO_IMAGE.size);

      // Voile = fondu bas du hero (moitié basse de sa boîte) + fond plein
      // en dessous. Il part sous la photo entière et monte avec la caméra.
      const fadeHeight = heroBox.height / 2;
      const veilTop = heroBox.y + fadeHeight;
      veil.style.top = `${veilTop}px`;
      veilFade.style.height = `${fadeHeight}px`;
      const veilStart = start.y + start.height - veilTop;

      const timing = { duration: PUSH_MS, easing: PUSH_EASING, fill: "forwards" } as const;
      const push = photo.animate(
        [
          { transform: "translate(0px, 0px) scale(1)" },
          {
            transform: `translate(${move.translateX}px, ${move.translateY}px) scale(${move.scale})`,
          },
        ],
        timing,
      );
      animations.push(
        photo.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: PHOTO_FADE_IN_MS,
          easing: "ease-out",
          fill: "both",
        }),
        push,
        veil.animate(
          [{ transform: `translateY(${veilStart}px)` }, { transform: "translateY(0px)" }],
          timing,
        ),
      );

      // La bascule part de la fin réelle de la poussée, jamais d'une
      // minuterie séparée : même avec un à-coup, le raccord reste exact.
      push.finished.then(
        () => close(SWAP_MS),
        () => undefined,
      );
    };

    // Photo prête (chargée et décodée) avant de lancer la caméra ; sinon on
    // renonce proprement plutôt que d'animer un cadre vide.
    const imageTimer = window.setTimeout(() => close(SKIP_FADE_MS), IMAGE_TIMEOUT_MS);
    img.decode().then(play, () => close(SKIP_FADE_MS));

    return () => {
      cancelled = true;
      window.clearTimeout(imageTimer);
      window.clearTimeout(revealTimer);
      animations.forEach((animation) => animation.cancel());
      html.style.overflow = previousOverflow;
      setIntroPhase(null);
      closeRef.current = null;
    };
  }, [visible, heroRef]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      onPointerDown={() => closeRef.current?.(SKIP_FADE_MS)}
      className="vg-intro fixed inset-0 z-[100] flex touch-none justify-center bg-bg-main motion-reduce:hidden"
    >
      <div ref={stageRef} className="relative h-full w-full max-w-[480px] overflow-hidden">
        {/* Photo entière, pleine largeur, centrée verticalement. */}
        <div
          ref={photoRef}
          className="absolute left-0 aspect-square w-full opacity-0 will-change-transform"
          style={{ top: "calc(50% - min(100vw, 480px) / 2)", transformOrigin: "0 0" }}
        >
          <Image
            src={HERO_IMAGE.src}
            alt=""
            fill
            sizes="(max-width: 520px) 100vw, 480px"
            unoptimized
            priority
            className="object-cover"
          />
        </div>

        {/* Voile qui monte avec la caméra ; hors champ tant que le JS ne l'a pas placé. */}
        <div
          ref={veilRef}
          className="pointer-events-none absolute inset-x-0 will-change-transform"
          style={{ top: "100%" }}
        >
          <div
            ref={veilFadeRef}
            className="bg-gradient-to-t from-bg-main via-bg-main/80 to-transparent"
          />
          <div className="h-[100dvh] bg-bg-main" />
        </div>

        {/* Même voile haut que le hero : identique au pixel près en fin de course. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[941/974] max-h-[45dvh] w-full bg-gradient-to-b from-black/65 via-transparent to-transparent" />

        <HeroLogo />
      </div>
    </div>
  );
}
