"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Booking } from "@/types/booking";
import type { TeeTime } from "@/types/golf";
import type { PartialAssistantAnswers } from "@/types/assistant";

export const STORAGE_KEY = "viet-golf-demo-v1";

export type SearchState = {
  area: string;
  date: string;
  players: number;
};

export type PendingSelection = {
  golfId: string;
  teeTimeId: string;
  date: string;
  time: string;
  players: number;
};

type DemoState = {
  hydrated: boolean;
  search: SearchState;
  assistantAnswers: PartialAssistantAnswers;
  teeTimeOverrides: Record<string, TeeTime>;
  deletedTeeTimeIds: string[];
  bookings: Record<string, Booking>;
  pendingSelection: PendingSelection | null;

  setHydrated: (value: boolean) => void;
  setSearch: (patch: Partial<SearchState>) => void;
  setAssistantAnswers: (answers: PartialAssistantAnswers) => void;
  resetAssistantAnswers: () => void;
  upsertTeeTime: (teeTime: TeeTime) => void;
  deleteTeeTime: (id: string) => void;
  addBooking: (booking: Booking) => void;
  setPendingSelection: (selection: PendingSelection | null) => void;
  resetDemoData: () => void;
};

const initialSearch: SearchState = {
  area: "TP. Hồ Chí Minh",
  date: "",
  players: 2,
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      hydrated: false,
      search: initialSearch,
      assistantAnswers: {},
      teeTimeOverrides: {},
      deletedTeeTimeIds: [],
      bookings: {},
      pendingSelection: null,

      setHydrated: (value) => set({ hydrated: value }),
      setSearch: (patch) => set((state) => ({ search: { ...state.search, ...patch } })),
      setAssistantAnswers: (answers) =>
        set((state) => ({ assistantAnswers: { ...state.assistantAnswers, ...answers } })),
      resetAssistantAnswers: () => set({ assistantAnswers: {} }),
      upsertTeeTime: (teeTime) =>
        set((state) => ({
          teeTimeOverrides: { ...state.teeTimeOverrides, [teeTime.id]: teeTime },
          deletedTeeTimeIds: state.deletedTeeTimeIds.filter((id) => id !== teeTime.id),
        })),
      deleteTeeTime: (id) =>
        set((state) => {
          const overrides = { ...state.teeTimeOverrides };
          delete overrides[id];
          return {
            teeTimeOverrides: overrides,
            deletedTeeTimeIds: state.deletedTeeTimeIds.includes(id)
              ? state.deletedTeeTimeIds
              : [...state.deletedTeeTimeIds, id],
          };
        }),
      addBooking: (booking) =>
        set((state) => ({ bookings: { ...state.bookings, [booking.id]: booking } })),
      setPendingSelection: (selection) => set({ pendingSelection: selection }),
      resetDemoData: () =>
        set({
          teeTimeOverrides: {},
          deletedTeeTimeIds: [],
          bookings: {},
          pendingSelection: null,
          assistantAnswers: {},
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Réhydratation déclenchée après le montage (voir HydrationGate) afin
      // que le premier rendu client soit identique au rendu serveur.
      skipHydration: true,
      // Les réponses OpenAI ne sont jamais persistées : seules les données
      // de démonstration et les choix de l'utilisateur le sont.
      partialize: (state) => ({
        search: state.search,
        assistantAnswers: state.assistantAnswers,
        teeTimeOverrides: state.teeTimeOverrides,
        deletedTeeTimeIds: state.deletedTeeTimeIds,
        bookings: state.bookings,
        pendingSelection: state.pendingSelection,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
