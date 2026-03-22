"use client";

import Link from "next/link";
import { CalendarClock, ListChecks, Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ConsultationCard } from "@/components/consultations/consultation-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { useMeQuery } from "@/lib/query/auth";
import { useMyConsultationsQuery } from "@/lib/query/consultations";

export default function DashboardPage() {
  const meQuery = useMeQuery();
  const consultationsQuery = useMyConsultationsQuery({
    status: "",
    scheduledFrom: "",
    scheduledTo: "",
    page: 1,
    pageSize: 3,
  });

  if (meQuery.isPending || consultationsQuery.isPending) {
    return (
      <LoadingState
        title="Building your dashboard"
        description="Loading your profile and upcoming consultations."
      />
    );
  }

  const upcoming = consultationsQuery.data?.items[0];
  const firstName = meQuery.data?.profile?.firstName ?? "Student";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        description=""
        actions={
          <Button asChild>
            <Link href="/dashboard/consultations/new">
              <Plus className="h-4 w-4" />
              Book consultation
            </Link>
          </Button>
        }
      />

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <ListChecks className="h-5 w-5 text-brand-blue" />
            <p className="mt-4 text-sm text-muted-foreground">Total consultations</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">
              {consultationsQuery.data?.total ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CalendarClock className="h-5 w-5 text-brand-blue" />
            <p className="mt-4 text-sm text-muted-foreground">Next session</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {upcoming
                  ? formatDateTime(upcoming.scheduledAt)
                  : "Nothing scheduled yet"}
              </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-foreground">
            Upcoming consultations
          </h2>
          <Link
            href="/dashboard/consultations"
            className="text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        {consultationsQuery.data?.items.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {consultationsQuery.data.items.map((consultation) => (
              <ConsultationCard
                key={consultation.id}
                consultation={consultation}
                href={`/dashboard/consultations/${consultation.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No consultations yet"
            description=""
            actionHref="/dashboard/consultations/new"
            actionLabel="Book consultation"
          />
        )}
      </section>
    </div>
  );
}
