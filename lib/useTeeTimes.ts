"use client";

import { useMemo } from "react";
import { useDemoStore } from "@/store/demoStore";
import { mergeTeeTimes } from "@/repositories/LocalDemoRepository";
import type { TeeTime } from "@/types/golf";

/**
 * Tee times d'un parcours pour une date, recalculés dès qu'une donnée de
 * démonstration change (mini admin, réservation).
 */
export function useTeeTimes(golfId: string, date: string): TeeTime[] {
  const overrides = useDemoStore((s) => s.teeTimeOverrides);
  const deleted = useDemoStore((s) => s.deletedTeeTimeIds);

  return useMemo(
    () => mergeTeeTimes(golfId, date, overrides, deleted),
    [golfId, date, overrides, deleted],
  );
}
