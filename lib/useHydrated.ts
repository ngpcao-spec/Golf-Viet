"use client";

import { useDemoStore } from "@/store/demoStore";

/** `true` une fois les données de démonstration relues depuis localStorage. */
export function useHydrated(): boolean {
  return useDemoStore((s) => s.hydrated);
}
