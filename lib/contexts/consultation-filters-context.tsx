"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConsultationFilters } from "@/lib/types/frontend";

type ConsultationFiltersContextValue = {
  filters: ConsultationFilters & { studentId?: string };
  setFilters: (
    next:
      | (ConsultationFilters & { studentId?: string })
      | ((
          current: ConsultationFilters & { studentId?: string },
        ) => ConsultationFilters & { studentId?: string }),
  ) => void;
  updateFilters: (patch: Partial<ConsultationFilters & { studentId?: string }>) => void;
  resetFilters: () => void;
};

const ConsultationFiltersContext =
  createContext<ConsultationFiltersContextValue | null>(null);

type ConsultationFiltersProviderProps = {
  children: ReactNode;
  initialFilters: ConsultationFilters & { studentId?: string };
  storageKey: string;
};

export function ConsultationFiltersProvider({
  children,
  initialFilters,
  storageKey,
}: ConsultationFiltersProviderProps) {
  const [filters, setFiltersState] =
    useState<ConsultationFilters & { studentId?: string }>(initialFilters);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    try {
      const persisted = JSON.parse(raw) as Partial<
        ConsultationFilters & { studentId?: string }
      >;
      setFiltersState((current) => ({ ...current, ...persisted }));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, storageKey]);

  const value = useMemo<ConsultationFiltersContextValue>(
    () => ({
      filters,
      setFilters: (next) => {
        setFiltersState((current) =>
          typeof next === "function" ? next(current) : next,
        );
      },
      updateFilters: (patch) => {
        setFiltersState((current) => ({ ...current, ...patch, page: 1 }));
      },
      resetFilters: () => {
        setFiltersState(initialFilters);
      },
    }),
    [filters, initialFilters],
  );

  return (
    <ConsultationFiltersContext.Provider value={value}>
      {children}
    </ConsultationFiltersContext.Provider>
  );
}

export function useConsultationFilters() {
  const context = useContext(ConsultationFiltersContext);

  if (!context) {
    throw new Error(
      "useConsultationFilters must be used within ConsultationFiltersProvider",
    );
  }

  return context;
}
