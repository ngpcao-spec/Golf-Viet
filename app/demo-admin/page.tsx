"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Trash2, RotateCcw, Save, ArrowLeft } from "lucide-react";
import Badge from "@/components/common/Badge";
import { GoldButton } from "@/components/common/GoldButton";
import { courses } from "@/data/courses";
import { demoDates, longDateVi } from "@/lib/dates/demoDates";
import { localDemoRepository } from "@/repositories/LocalDemoRepository";
import { useTeeTimes } from "@/lib/useTeeTimes";
import { useHydrated } from "@/lib/useHydrated";
import { formatVND } from "@/lib/money/formatVND";
import type { TeeTime } from "@/types/golf";

type Draft = {
  time: string;
  price: string;
  originalPrice: string;
  discountPercent: string;
  remainingSlots: string;
};

function toDraft(teeTime: TeeTime): Draft {
  return {
    time: teeTime.time,
    price: String(teeTime.price),
    originalPrice: teeTime.originalPrice === null ? "" : String(teeTime.originalPrice),
    discountPercent: String(teeTime.discountPercent),
    remainingSlots: String(teeTime.remainingSlots),
  };
}

const inputClass =
  "min-h-[44px] w-full rounded-[10px] border border-border-gold bg-bg-secondary px-3 text-[14px] text-text-main";

export default function DemoAdminPage() {
  const hydrated = useHydrated();
  const [golfId, setGolfId] = useState(courses[0]?.id ?? "");
  const dates = useMemo(() => demoDates(8), []);
  const [date, setDate] = useState(dates[1] ?? dates[0] ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const teeTimes = useTeeTimes(golfId, date);
  const course = courses.find((c) => c.id === golfId);

  const startEdit = (teeTime: TeeTime) => {
    setEditingId(teeTime.id);
    setDraft(toDraft(teeTime));
    setMessage(null);
  };

  const saveEdit = (teeTime: TeeTime) => {
    if (!draft) return;
    const price = Number(draft.price);
    const remainingSlots = Number(draft.remainingSlots);
    const discountPercent = Number(draft.discountPercent);
    const originalPrice = draft.originalPrice === "" ? null : Number(draft.originalPrice);

    if (
      !/^\d{2}:\d{2}$/.test(draft.time) ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(remainingSlots) ||
      remainingSlots < 0 ||
      remainingSlots > 4
    ) {
      setMessage("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    localDemoRepository.updateTeeTime({
      ...teeTime,
      time: draft.time,
      price: Math.round(price),
      originalPrice: originalPrice !== null && Number.isFinite(originalPrice)
        ? Math.round(originalPrice)
        : null,
      discountPercent: Number.isFinite(discountPercent) ? Math.round(discountPercent) : 0,
      remainingSlots: Math.round(remainingSlots),
      status: remainingSlots > 0 ? "available" : "full",
    });

    setEditingId(null);
    setDraft(null);
    setMessage("Đã lưu thay đổi.");
  };

  const addTeeTime = () => {
    const used = new Set(teeTimes.map((t) => t.time));
    const candidate =
      ["05:30", "11:00", "11:30", "12:00", "15:30", "16:00", "16:30"].find(
        (t) => !used.has(t),
      ) ?? "17:00";

    const created: TeeTime = {
      id: `${golfId}-${date}-${candidate.replace(":", "")}-custom-${Date.now()}`,
      golfId,
      date,
      time: candidate,
      price: course?.basePrice ?? 1_500_000,
      originalPrice: null,
      discountPercent: 0,
      remainingSlots: 4,
      status: "available",
    };
    localDemoRepository.createTeeTime(created);
    setMessage(`Đã thêm giờ ${candidate}.`);
  };

  const removeTeeTime = (id: string) => {
    localDemoRepository.deleteTeeTime(id);
    if (editingId === id) {
      setEditingId(null);
      setDraft(null);
    }
    setMessage("Đã xóa giờ phát bóng.");
  };

  const reset = () => {
    if (!window.confirm("Khôi phục toàn bộ dữ liệu demo? Thao tác này không thể hoàn tác.")) {
      return;
    }
    localDemoRepository.resetDemoData();
    setEditingId(null);
    setDraft(null);
    setMessage("Đã khôi phục dữ liệu demo.");
  };

  return (
    <main className="safe-top px-4 pb-10">
      <div className="flex items-center justify-between gap-3 pb-4">
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-2 text-[13px] font-medium text-text-secondary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Trang chủ
        </Link>
        <Badge tone="gold">MÀN HÌNH NỘI BỘ — DEMO</Badge>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold">
        Quản lý giờ phát bóng
      </h1>
      <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
        Thay đổi chỉ được lưu trên trình duyệt này và hiển thị ngay ở phía khách hàng của
        cùng thiết bị.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[12px] text-text-secondary">Sân golf</span>
          <select
            value={golfId}
            onChange={(e) => setGolfId(e.target.value)}
            className={inputClass}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] text-text-secondary">Ngày chơi</span>
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          >
            {dates.map((iso) => (
              <option key={iso} value={iso}>
                {longDateVi(iso)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={addTeeTime}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[rgba(216,180,90,0.35)] text-[14px] font-semibold text-gold"
        >
          <Plus className="size-4" aria-hidden="true" />
          Thêm giờ
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[rgba(232,86,79,0.4)] text-[14px] font-semibold text-promo-red"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Khôi phục dữ liệu demo
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className="mt-3 rounded-[12px] border border-border-gold bg-card px-3 py-2.5 text-[13px] text-gold"
        >
          {message}
        </p>
      ) : null}

      {!hydrated ? (
        <p className="mt-5 text-[13px] text-text-secondary">Đang tải dữ liệu demo...</p>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {teeTimes.length === 0 ? (
            <li className="rounded-[16px] border border-border-gold bg-card p-4 text-[13px] text-text-secondary">
              Chưa có giờ phát bóng cho ngày này.
            </li>
          ) : null}

          {teeTimes.map((teeTime) => {
            const editing = editingId === teeTime.id;
            return (
              <li
                key={teeTime.id}
                className="rounded-[16px] border border-border-gold bg-card p-3.5"
              >
                {editing && draft ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] text-text-secondary">Giờ</span>
                        <input
                          className={inputClass}
                          value={draft.time}
                          inputMode="numeric"
                          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] text-text-secondary">
                          Còn chỗ (0–4)
                        </span>
                        <input
                          className={inputClass}
                          value={draft.remainingSlots}
                          inputMode="numeric"
                          onChange={(e) =>
                            setDraft({ ...draft, remainingSlots: e.target.value })
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] text-text-secondary">Giá</span>
                        <input
                          className={inputClass}
                          value={draft.price}
                          inputMode="numeric"
                          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] text-text-secondary">
                          Giá gốc
                        </span>
                        <input
                          className={inputClass}
                          value={draft.originalPrice}
                          inputMode="numeric"
                          placeholder="Để trống nếu không giảm"
                          onChange={(e) =>
                            setDraft({ ...draft, originalPrice: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2 block">
                        <span className="mb-1 block text-[11px] text-text-secondary">
                          Giảm giá (%)
                        </span>
                        <input
                          className={inputClass}
                          value={draft.discountPercent}
                          inputMode="numeric"
                          onChange={(e) =>
                            setDraft({ ...draft, discountPercent: e.target.value })
                          }
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <GoldButton onClick={() => saveEdit(teeTime)} className="min-h-[44px]">
                        <Save className="size-4" aria-hidden="true" />
                        Lưu
                      </GoldButton>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setDraft(null);
                        }}
                        className="min-h-[44px] rounded-[12px] border border-border-gold text-[14px] font-semibold text-text-secondary"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-[58px] shrink-0">
                      <p className="text-[16px] font-semibold">{teeTime.time}</p>
                      <p className="text-[11px] text-text-secondary">
                        Còn {teeTime.remainingSlots}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-gold">
                        {formatVND(teeTime.price)}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {teeTime.discountPercent > 0
                          ? `-${teeTime.discountPercent}% • gốc ${
                              teeTime.originalPrice ? formatVND(teeTime.originalPrice) : "—"
                            }`
                          : "Không giảm giá"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(teeTime)}
                      className="min-h-[44px] shrink-0 rounded-[10px] border border-[rgba(216,180,90,0.35)] px-3 text-[13px] font-semibold text-gold"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa giờ ${teeTime.time}`}
                      onClick={() => removeTeeTime(teeTime.id)}
                      className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(232,86,79,0.35)] text-promo-red"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
