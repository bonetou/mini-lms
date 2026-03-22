"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRouteGuard } from "@/components/protected-route-guard";
import { BookingModalProvider } from "@/lib/contexts/booking-modal-context";
import { ConsultationFiltersProvider } from "@/lib/contexts/consultation-filters-context";
import { TablePreferencesProvider } from "@/lib/contexts/table-preferences-context";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRouteGuard redirectIfAdminTo="/admin">
      <BookingModalProvider>
        <ConsultationFiltersProvider
          initialFilters={{
            status: "",
            scheduledFrom: "",
            scheduledTo: "",
            page: 1,
            pageSize: 10,
          }}
          storageKey="student-consultation-filters"
        >
          <TablePreferencesProvider
            initialPreferences={{
              pageSize: 10,
              visibleColumns: ["reason", "scheduledAt", "status", "actions"],
            }}
            storageKey="student-table-preferences"
          >
            <AppShell
              title="Student Portal"
              subtitle="Manage your upcoming consultations, track changes, and keep support sessions organised."
              navItems={[
                { href: "/dashboard", label: "Overview" },
                { href: "/dashboard/consultations", label: "Consultations" },
                { href: "/dashboard/consultations/new", label: "Book new" },
              ]}
            >
              {children}
            </AppShell>
          </TablePreferencesProvider>
        </ConsultationFiltersProvider>
      </BookingModalProvider>
    </ProtectedRouteGuard>
  );
}
