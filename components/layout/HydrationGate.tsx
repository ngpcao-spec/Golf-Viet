"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/store/demoStore";

/** Déclenche la réhydratation localStorage après le montage, jamais pendant le SSR. */
export default function HydrationGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useDemoStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
