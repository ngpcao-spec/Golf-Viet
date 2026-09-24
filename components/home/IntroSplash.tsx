"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import HeroLogo from "@/components/home/HeroLogo";
import { HERO_IMAGE, heroMapping, introEndTransform } from "@/lib/intro/heroFraming";

/** Chronologie totale : 2,2 s = poussée caméra puis fondu vers l'accueil. */
const PHOTO_FADE_IN_MS = 450;
const PUSH_MS = 1750;
const FADE_OUT_MS = 450;
const SKIP_FADE_MS = 200;
/** Délai maximal d'attente de la photo avant de renoncer à l'intro. */
const IMAGE_TIMEOUT_MS = 900;
/** Au-delà, la page a trop tardé à s'hydrater : on n'impose pas l'intro. */
const LATE_START_MS = 2600;
const PUSH_EASING = "cubic-bezier(0.42, 0, 0.18, 1)";

/**
 * Vrai après la première lecture : l'intro se joue à chaque lancement de
 * l'application, pas lors d'un retour à l'accueil pendant la navigation.
 */
let introPlayed = false;

/**
 * Intro « caméra qui avance » : la photo large apparaît entière, puis la
 * caméra pousse jusqu'au cadrage exact du hero avant un fondu vers l'accueil,
 * déjà monté et fonctionnel dessous. Un toucher coupe l'intro.
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
  const closeRef = useRef<((fadeMs: number) => void) | null>(null);

  useEffect(() => {
    if (!visible) return;
    introPlayed = true;

    const overlay = overlayRef.current;
    const stage = stageRef.current;
    const photo = photoRef.current;
    const hero = heroRef.current;
    const img = photo?.querySelector("img");
    if (!overlay || !stage || !photo || !hero || !img) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || performance.now() > LATE_START_MS) {
      const frame = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(frame);
    }

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const animations: Animation[] = [];
    let closed = false;
    let cancelled = false;

    const close = (fadeMs: number) => {
      if (closed) return;
      closed = true;
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
      const photoBox = photo.getBoundingClientRect();
      const heroBox = hero.getBoundingClientRect();
      const relative = (box: DOMRect) => ({
        x: box.left - stageBox.left,
        y: box.top - stageBox.top,
        width: box.width,
        height: box.height,
      });

      const end = heroMapping(relative(heroBox), HERO_IMAGE.size, HERO_IMAGE);
      const move = introEndTransform(relative(photoBox), end, HERO_IMAGE.size);

      const push = photo.animate(
        [
          { transform: "translate(0px, 0px) scale(1)" },
          {
            transform: `translate(${move.translateX}px, ${move.translateY}px) scale(${move.scale})`,
          },
        ],
        { duration: PUSH_MS, easing: PUSH_EASING, fill: "forwards" },
      );
      animations.push(
        photo.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: PHOTO_FADE_IN_MS,
          easing: "ease-out",
          fill: "both",
        }),
        push,
      );

      // Le fondu part de la fin réelle de la poussée, jamais d'une minuterie
      // séparée : même avec un à-coup, la caméra est posée sur le cadrage
      // du hero quand l'accueil apparaît.
      push.finished.then(
        () => close(FADE_OUT_MS),
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
      animations.forEach((animation) => animation.cancel());
      html.style.overflow = previousOverflow;
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

        {/* Même voile que le hero : identique au pixel près en fin de course. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[941/974] max-h-[45dvh] w-full bg-gradient-to-b from-black/65 via-transparent to-transparent" />

        <HeroLogo />
      </div>
    </div>
  );
}
