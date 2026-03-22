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

type ExtendedConsultationFilters = ConsultationFilters & {
  studentId?: string;
  search?: string;
};

type ConsultationFiltersContextValue = {
  filters: ExtendedConsultationFilters;
  setFilters: (
    next:
      | ExtendedConsultationFilters
      | ((current: ExtendedConsultationFilters) => ExtendedConsultationFilters),
  ) => void;
  updateFilters: (patch: Partial<ExtendedConsultationFilters>) => void;
  resetFilters: () => void;
};

const ConsultationFiltersContext =
  createContext<ConsultationFiltersContextValue | null>(null);

type ConsultationFiltersProviderProps = {
  children: ReactNode;
  initialFilters: ExtendedConsultationFilters;
  storageKey: string;
};

export function ConsultationFiltersProvider({
  children,
  initialFilters,
  storageKey,
}: ConsultationFiltersProviderProps) {
  const [filters, setFiltersState] =
    useState<ExtendedConsultationFilters>(initialFilters);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    try {
      const persisted = JSON.parse(raw) as Partial<ExtendedConsultationFilters>;
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
