import { MapPin } from "lucide-react";

export default function MapCard({
  latitude,
  longitude,
  addressVi,
  distanceKm,
  name,
}: {
  latitude: number;
  longitude: number;
  addressVi: string;
  distanceKm: number;
  name: string;
}) {
  const d = 0.02;
  const bbox = [longitude - d, latitude - d, longitude + d, latitude + d].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <section className="overflow-hidden rounded-[16px] border border-border-gold bg-card">
      <iframe
        title={`Bản đồ ${name}`}
        src={src}
        loading="lazy"
        className="h-[190px] w-full border-0 opacity-90"
      />
      <div className="flex items-start gap-2 p-4">
        <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
        <div>
          <p className="text-[13px] text-text-main">{addressVi}</p>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            Khoảng cách từ trung tâm TP.HCM: {distanceKm} km
          </p>
        </div>
      </div>
    </section>
  );
}
