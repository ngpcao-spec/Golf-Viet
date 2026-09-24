/**
 * Cadrage de la photo d'accueil, partagé entre le hero et l'intro caméra.
 *
 * Le hero affiche la photo large en `object-fit: cover`, recentrée sur un point
 * focal puis zoomée autour de ce point. L'intro part de la photo entière et
 * « avance » jusqu'à ce cadrage exact : même image, même mapping à l'écran,
 * donc un raccord sans aucun saut.
 */
export const HERO_IMAGE = {
  src: "/images/hero-viet-golf-wide.jpg",
  /** Photo carrée : largeur = hauteur, en pixels. */
  size: 1254,
  /** Point focal, en fraction de l'image (0 = gauche / haut). */
  focalX: 0.7,
  focalY: 0.46,
  /** Zoom final appliqué autour du point focal. */
  zoom: 1.22,
} as const;

export type Framing = { focalX: number; focalY: number; zoom: number };

export type Rect = { x: number; y: number; width: number; height: number };

/** Projection de l'image à l'écran : coin haut-gauche et échelle (px écran / px image). */
export type ImageMapping = { originX: number; originY: number; scale: number };

/** Style CSS du hero correspondant exactement à `heroMapping`. */
export function heroImageStyle(framing: Framing): {
  objectPosition: string;
  transform: string;
  transformOrigin: string;
} {
  const position = `${framing.focalX * 100}% ${framing.focalY * 100}%`;
  return {
    objectPosition: position,
    transform: `scale(${framing.zoom})`,
    transformOrigin: position,
  };
}

/**
 * Où se trouve chaque pixel de la photo une fois affichée dans le hero.
 *
 * `object-position: fx% fy%` place le point (fx, fy) de l'image au point
 * (fx, fy) de la boîte ; le zoom autour de ce même point l'y maintient.
 */
export function heroMapping(hero: Rect, imageSize: number, framing: Framing): ImageMapping {
  const cover = Math.max(hero.width, hero.height) / imageSize;
  const displayed = imageSize * cover;
  const baseX = hero.x - framing.focalX * (displayed - hero.width);
  const baseY = hero.y - framing.focalY * (displayed - hero.height);
  const pivotX = hero.x + framing.focalX * hero.width;
  const pivotY = hero.y + framing.focalY * hero.height;
  return {
    originX: pivotX + (baseX - pivotX) * framing.zoom,
    originY: pivotY + (baseY - pivotY) * framing.zoom,
    scale: cover * framing.zoom,
  };
}

/**
 * Transform (origine `0 0`) qui amène la photo, affichée entière dans `start`,
 * sur le mapping final du hero.
 */
export function introEndTransform(
  start: Rect,
  end: ImageMapping,
  imageSize: number,
): { translateX: number; translateY: number; scale: number } {
  const startScale = start.width / imageSize;
  return {
    translateX: end.originX - start.x,
    translateY: end.originY - start.y,
    scale: end.scale / startScale,
  };
}
