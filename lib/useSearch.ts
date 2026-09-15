"use client";

import { useDemoStore } from "@/store/demoStore";
import { tomorrowIso } from "@/lib/dates/demoDates";

/** État de recherche courant, avec « demain » comme date par défaut. */
export function useSearch() {
  const search = useDemoStore((s) => s.search);
  const setSearch = useDemoStore((s) => s.setSearch);
  return {
    area: search.area,
    date: search.date || tomorrowIso(),
    players: search.players,
    setSearch,
  };
}
