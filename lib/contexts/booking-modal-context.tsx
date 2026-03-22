"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type BookingModalMode = "reschedule" | "cancel" | null;

type BookingModalState = {
  isOpen: boolean;
  mode: BookingModalMode;
  consultationId: string | null;
};

type BookingModalContextValue = BookingModalState & {
  openModal: (mode: Exclude<BookingModalMode, null>, consultationId: string) => void;
  closeModal: () => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingModalState>({
    isOpen: false,
    mode: null,
    consultationId: null,
  });

  const value = useMemo<BookingModalContextValue>(
    () => ({
      ...state,
      openModal: (mode, consultationId) => {
        setState({
          isOpen: true,
          mode,
          consultationId,
        });
      },
      closeModal: () => {
        setState({
          isOpen: false,
          mode: null,
          consultationId: null,
        });
      },
    }),
    [state],
  );

  return (
    <BookingModalContext.Provider value={value}>
      {children}
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);

  if (!context) {
    throw new Error("useBookingModal must be used within BookingModalProvider");
  }

  return context;
}
