"use client";

import { useEffect } from "react";
import { ConsultationTable } from "@/components/consultations/consultation-table";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultationFilters } from "@/lib/contexts/consultation-filters-context";
import { useTablePreferences } from "@/lib/contexts/table-preferences-context";
import { useAdminConsultationsQuery } from "@/lib/query/consultations";

export default function AdminConsultationsPage() {
  const { filters, updateFilters, setFilters } = useConsultationFilters();
  const { preferences, setPageSize } = useTablePreferences();

  useEffect(() => {
    if (filters.pageSize !== preferences.pageSize) {
      setFilters((current) => ({ ...current, pageSize: preferences.pageSize }));
    }
  }, [filters.pageSize, preferences.pageSize, setFilters]);

  const consultationsQuery = useAdminConsultationsQuery({
    ...filters,
    studentId: filters.studentId ?? "",
  });
  const hasNextPage =
    (consultationsQuery.data?.page ?? 1) *
      (consultationsQuery.data?.pageSize ?? preferences.pageSize) <
    (consultationsQuery.data?.total ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Consultations"
        title="All consultation records"
        description="Filter by student, status, or date range to inspect the platform-wide consultation queue."
      />

      <section className="grid gap-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-panel md:grid-cols-5">
        <div className="grid gap-2">
          <Label htmlFor="admin-status">Status</Label>
          <select
            id="admin-status"
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as typeof filters.status,
              })
            }
            className="h-11 rounded-full border border-input bg-background px-4 text-sm"
          >
            <option value="">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="student-id">Student ID</Label>
          <Input
            id="student-id"
            value={filters.studentId ?? ""}
            onChange={(event) => updateFilters({ studentId: event.target.value })}
            placeholder="UUID"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-scheduled-from">From</Label>
          <Input
            id="admin-scheduled-from"
            type="date"
            value={filters.scheduledFrom}
            onChange={(event) =>
              updateFilters({ scheduledFrom: event.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-scheduled-to">To</Label>
          <Input
            id="admin-scheduled-to"
            type="date"
            value={filters.scheduledTo}
            onChange={(event) =>
              updateFilters({ scheduledTo: event.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-page-size">Rows</Label>
          <select
            id="admin-page-size"
            value={preferences.pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-11 rounded-full border border-input bg-background px-4 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </section>

      {consultationsQuery.isPending ? (
        <LoadingState
          title="Loading consultations"
          description="Querying the admin consultation endpoint."
        />
      ) : consultationsQuery.data?.items.length ? (
        <>
          <ConsultationTable
            consultations={consultationsQuery.data.items}
            detailBasePath="/admin/consultations"
            showStudentColumn
          />
          <div className="flex items-center justify-between rounded-[1.5rem] border border-border bg-card px-5 py-4 shadow-panel">
            <p className="text-sm text-muted-foreground">
              Showing page {filters.page} of{" "}
              {Math.max(
                1,
                Math.ceil(
                  (consultationsQuery.data.total ?? 0) /
                    (consultationsQuery.data.pageSize ?? preferences.pageSize),
                ),
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1),
                  }))
                }
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50"
                disabled={!hasNextPage}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No matching consultations"
          description="Adjust the filters to inspect a different set of records."
        />
      )}
    </div>
  );
}
