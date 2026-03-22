"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TablePreferences } from "@/lib/types/frontend";

type TablePreferencesContextValue = {
  preferences: TablePreferences;
  setPageSize: (pageSize: number) => void;
  toggleColumn: (columnId: string) => void;
};

const TablePreferencesContext =
  createContext<TablePreferencesContextValue | null>(null);

type TablePreferencesProviderProps = {
  children: ReactNode;
  storageKey: string;
  initialPreferences: TablePreferences;
};

export function TablePreferencesProvider({
  children,
  storageKey,
  initialPreferences,
}: TablePreferencesProviderProps) {
  const [preferences, setPreferences] =
    useState<TablePreferences>(initialPreferences);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TablePreferences;
      setPreferences(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  const value = useMemo<TablePreferencesContextValue>(
    () => ({
      preferences,
      setPageSize: (pageSize) =>
        setPreferences((current) => ({ ...current, pageSize })),
      toggleColumn: (columnId) =>
        setPreferences((current) => {
          const visibleColumns = current.visibleColumns.includes(columnId)
            ? current.visibleColumns.filter((item) => item !== columnId)
            : [...current.visibleColumns, columnId];

          return {
            ...current,
            visibleColumns,
          };
        }),
    }),
    [preferences],
  );

  return (
    <TablePreferencesContext.Provider value={value}>
      {children}
    </TablePreferencesContext.Provider>
  );
}

export function useTablePreferences() {
  const context = useContext(TablePreferencesContext);

  if (!context) {
    throw new Error("useTablePreferences must be used within TablePreferencesProvider");
  }

  return context;
}
