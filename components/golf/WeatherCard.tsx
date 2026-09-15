import { Sun, Droplets, Wind } from "lucide-react";
import Badge from "@/components/common/Badge";
import type { WeatherDemo } from "@/types/golf";

export default function WeatherCard({ weather }: { weather: WeatherDemo }) {
  return (
    <section className="rounded-[16px] border border-border-gold bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-main">Thời tiết hôm nay</h3>
        <Badge>Dữ liệu demo</Badge>
      </div>
      <div className="flex items-center gap-4">
        <Sun className="size-9 shrink-0 text-gold" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[26px] font-semibold leading-none text-text-main">
            {weather.temperatureC}°C
          </p>
          <p className="mt-1 text-[12px] text-text-secondary">{weather.conditionVi}</p>
        </div>
        <dl className="ml-auto flex gap-5 text-right">
          <div>
            <dt className="flex items-center justify-end gap-1 text-[11px] text-text-secondary">
              <Droplets className="size-3" aria-hidden="true" /> Độ ẩm
            </dt>
            <dd className="text-[14px] font-semibold text-text-main">
              {weather.humidityPercent}%
            </dd>
          </div>
          <div>
            <dt className="flex items-center justify-end gap-1 text-[11px] text-text-secondary">
              <Wind className="size-3" aria-hidden="true" /> Gió
            </dt>
            <dd className="text-[14px] font-semibold text-text-main">
              {weather.windKmh} km/h
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
