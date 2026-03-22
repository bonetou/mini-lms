"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRouteGuard } from "@/components/protected-route-guard";
import { RoleGuard } from "@/components/role-guard";
import { ConsultationFiltersProvider } from "@/lib/contexts/consultation-filters-context";
import { TablePreferencesProvider } from "@/lib/contexts/table-preferences-context";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRouteGuard>
      <RoleGuard requiredRole="admin">
        <ConsultationFiltersProvider
          initialFilters={{
            status: "",
            scheduledFrom: "",
            scheduledTo: "",
            search: "",
            page: 1,
            pageSize: 10,
            studentId: "",
          }}
          storageKey="admin-consultation-filters"
        >
          <TablePreferencesProvider
            initialPreferences={{
              pageSize: 10,
              visibleColumns: [
                "student",
                "reason",
                "scheduledAt",
                "status",
                "actions",
              ],
            }}
            storageKey="admin-table-preferences"
          >
            <AppShell
              title="Admin Console"
              subtitle=""
              navItems={[
                { href: "/admin", label: "Overview" },
                { href: "/admin/consultations", label: "Consultations" },
              ]}
            >
              {children}
            </AppShell>
          </TablePreferencesProvider>
        </ConsultationFiltersProvider>
      </RoleGuard>
    </ProtectedRouteGuard>
  );
}
