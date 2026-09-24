"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import HeroLogo from "@/components/home/HeroLogo";
import { HERO_IMAGE, heroMapping, introEndTransform } from "@/lib/intro/heroFraming";
import { getIntroPhase, setIntroOverlay, setIntroPhase, startReveal } from "@/lib/intro/reveal";

/**
 * Chronologie : apparition de la photo, longue poussée caméra qui se pose en
 * douceur. L'accueil commence à se construire PENDANT la poussée, par-dessus
 * la photo, et se pose avec elle (voir lib/intro/reveal.ts).
 */
const PHOTO_FADE_IN_MS = 1000;
const PUSH_MS = 3400;
/**
 * Départ doux et mouvement réparti sur toute la durée : la caméra avance
 * encore nettement pendant que l'accueil se construit, puis se pose en douceur.
 */
const PUSH_EASING = "cubic-bezier(0.45, 0, 0.25, 1)";
/**
 * Instant de la poussée où l'accueil commence à se construire (~38 % du temps,
 * ~50 % du trajet) ; la cascade se termine avec l'atterrissage de la caméra.
 */
const REVEAL_AT_MS = 1300;
/** En fin de poussée, intro et accueil sont identiques : bascule quasi instantanée. */
const SWAP_MS = 220;
const SKIP_FADE_MS = 300;
/** Délai maximal d'attente de la photo avant de renoncer à l'intro. */
const IMAGE_TIMEOUT_MS = 900;
/** Au-delà, la page a trop tardé à s'hydrater : on n'impose pas l'intro. */
const LATE_START_MS = 2000;

/**
 * Vrai après la première lecture : l'intro se joue à chaque lancement de
 * l'application, pas lors d'un retour à l'accueil pendant la navigation.
 */
let introPlayed = false;

/**
 * Intro « caméra qui avance ». La photo large apparaît entière, puis la caméra
 * pousse jusqu'au cadrage exact du hero. Un voile monte avec elle et prend la
 * forme exacte du fondu bas du hero. À mi-course, les éléments de l'accueil
 * commencent à entrer par-dessus l'intro, si bien que page et caméra se posent
 * ensemble ; l'overlay, devenu identique au hero, disparaît alors sans saut.
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
  const shadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    introPlayed = true;

    const overlay = overlayRef.current;
    const stage = stageRef.current;
    const photo = photoRef.current;
    const veil = veilRef.current;
    const veilFade = veilFadeRef.current;
    const shade = shadeRef.current;
    const hero = heroRef.current;
    const img = photo?.querySelector("img");
    if (!overlay || !stage || !photo || !veil || !veilFade || !shade || !hero || !img) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || performance.now() > LATE_START_MS) {
      const frame = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(frame);
    }

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    // L'accueil attend, masqué, au-dessus de l'intro où il se construira.
    setIntroPhase("playing");
    setIntroOverlay(true);

    const animations: Animation[] = [];
    let closed = false;
    let cancelled = false;
    // La cascade ne démarre qu'une fois par intro : quand la caméra se pose,
    // elle peut déjà être terminée et ne doit surtout pas repartir.
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      startReveal();
    };

    const close = (fadeMs: number) => {
      if (closed) return;
      closed = true;
      document.removeEventListener("pointerdown", skip, true);
      // Si la cascade n'a pas encore démarré (toucher, photo indisponible),
      // elle démarre maintenant ; sinon elle poursuit sa course sans saut.
      reveal();

      const from = getComputedStyle(overlay).opacity;
      const fade = overlay.animate([{ opacity: from }, { opacity: 0 }], {
        duration: fadeMs,
        easing: "ease-out",
        fill: "forwards",
      });
      animations.push(fade);
      fade.onfinish = () => {
        html.style.overflow = previousOverflow;
        setIntroOverlay(false);
        setVisible(false);
      };
    };

    // Toucher n'importe où — y compris sur un élément déjà apparu de l'accueil,
    // qui reçoit quand même son toucher — coupe l'intro.
    const skip = () => close(SKIP_FADE_MS);
    document.addEventListener("pointerdown", skip, true);

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

      // Voile haut (lisibilité du logo) : exactement la boîte mesurée du hero.
      // Surtout pas de ratio + hauteur max en CSS : sur un élément positionné
      // en absolu, Safari en déduit une largeur réduite.
      shade.style.left = `${heroBox.x}px`;
      shade.style.top = `${heroBox.y}px`;
      shade.style.width = `${heroBox.width}px`;
      shade.style.height = `${heroBox.height}px`;

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

      // Les deux signaux sont portés par la même horloge que la caméra, jamais
      // par des minuteries séparées : même avec un à-coup, l'accueil démarre
      // au bon moment de la poussée et la bascule tombe sur le raccord exact.
      const cue = stage.animate([{ opacity: 1 }, { opacity: 1 }], { duration: REVEAL_AT_MS });
      animations.push(cue);
      cue.finished.then(reveal, () => undefined);
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
      document.removeEventListener("pointerdown", skip, true);
      animations.forEach((animation) => animation.cancel());
      html.style.overflow = previousOverflow;
      setIntroOverlay(false);
      // Intro interrompue avant la cascade (navigation) : on rend la page
      // visible. Une cascade en cours, elle, va au bout d'elle-même.
      if (getIntroPhase() === "playing") setIntroPhase(null);
    };
  }, [visible, heroRef]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
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

        {/* Même voile haut que le hero, dimensionné par le JS sur sa boîte mesurée. */}
        <div
          ref={shadeRef}
          className="pointer-events-none absolute left-0 top-0 h-0 w-full bg-gradient-to-b from-black/65 via-transparent to-transparent"
        />

        <HeroLogo />
      </div>
    </div>
  );
}
