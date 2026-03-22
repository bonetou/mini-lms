"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { ConsultationTable } from "@/components/consultations/consultation-table";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultationFilters } from "@/lib/contexts/consultation-filters-context";
import { useTablePreferences } from "@/lib/contexts/table-preferences-context";
import { useMyConsultationsQuery } from "@/lib/query/consultations";

export default function StudentConsultationsPage() {
  const { filters, updateFilters, setFilters } = useConsultationFilters();
  const { preferences, setPageSize } = useTablePreferences();

  useEffect(() => {
    if (filters.pageSize !== preferences.pageSize) {
      setFilters((current) => ({ ...current, pageSize: preferences.pageSize }));
    }
  }, [filters.pageSize, preferences.pageSize, setFilters]);

  const consultationsQuery = useMyConsultationsQuery(filters);
  const hasNextPage =
    (consultationsQuery.data?.page ?? 1) *
      (consultationsQuery.data?.pageSize ?? preferences.pageSize) <
    (consultationsQuery.data?.total ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Consultations"
        title="Your consultation schedule"
        description="Filter your bookings, open consultation details, and keep everything on track from one view."
        actions={
          <Button asChild>
            <Link href="/dashboard/consultations/new">
              <Plus className="h-4 w-4" />
              New consultation
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-panel md:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
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
          <Label htmlFor="scheduled-from">From</Label>
          <Input
            id="scheduled-from"
            type="date"
            value={filters.scheduledFrom}
            onChange={(event) =>
              updateFilters({ scheduledFrom: event.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="scheduled-to">To</Label>
          <Input
            id="scheduled-to"
            type="date"
            value={filters.scheduledTo}
            onChange={(event) =>
              updateFilters({ scheduledTo: event.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="page-size">Rows</Label>
          <select
            id="page-size"
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
          description="Pulling your current list from the API."
        />
      ) : consultationsQuery.data?.items.length ? (
        <>
          <ConsultationTable
            consultations={consultationsQuery.data.items}
            detailBasePath="/dashboard/consultations"
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
              <Button
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1),
                  }))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!hasNextPage}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No consultations found"
          description="Try changing the filters or create a new consultation request."
          actionHref="/dashboard/consultations/new"
          actionLabel="Create consultation"
        />
      )}
    </div>
  );
}
