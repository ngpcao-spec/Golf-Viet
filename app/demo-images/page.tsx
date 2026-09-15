"use client";

import SafeImage from "@/components/common/SafeImage";

/**
 * Page temporaire de sélection de la photo hero.
 * À supprimer une fois le visuel d'accueil choisi.
 */
const CANDIDATES = [
  "photo-1535131749006-b7f58c99034b",
  "photo-1587381420270-3e1a5b9e6904",
  "photo-1592919505780-303950717480",
  "photo-1611374243147-44a702c2d44c",
  "photo-1500932334442-8761ee4810a7",
  "photo-1593111774240-d529f12cf4bb",
  "photo-1519834785169-98be25ec3f84",
  "photo-1622819584099-e04ccb14e8a7",
  "photo-1576941089067-2de3c901e126",
  "photo-1471479917193-f00955256257",
  "photo-1632946280126-0d6a0e1e8ba3",
  "photo-1600166898405-da9535204843",
  "photo-1560053608-13721e0d69e8",
  "photo-1562204320-4a48ea0f6e3d",
];

export default function DemoImagesPage() {
  return (
    <main className="safe-top px-4 pb-10">
      <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold">
        Choix de la photo d&apos;accueil
      </h1>
      <p className="mt-1 text-[12px] text-text-secondary">
        Page temporaire. Donne-moi le numéro de la photo que tu préfères.
      </p>

      <ul className="mt-5 space-y-5">
        {CANDIDATES.map((id, index) => (
          <li key={id}>
            <p className="mb-1.5 text-[15px] font-semibold text-gold">
              #{index + 1}
            </p>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] border border-border-gold">
              <SafeImage
                src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`}
                alt={`Proposition ${index + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-bg-main" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-[family-name:var(--font-display)] text-[24px] leading-tight font-semibold">
                  Những sân golf
                  <br />
                  <span className="gold-text">đẳng cấp</span> đang chờ bạn
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
