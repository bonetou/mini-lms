"use client";

import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminConsultationsQuery } from "@/lib/query/consultations";

export default function AdminDashboardPage() {
  const consultationsQuery = useAdminConsultationsQuery({
    status: "",
    scheduledFrom: "",
    scheduledTo: "",
    page: 1,
    pageSize: 5,
    studentId: "",
  });

  if (consultationsQuery.isPending) {
    return (
      <LoadingState
        title="Loading admin dashboard"
        description="Collecting consultation activity across the platform."
      />
    );
  }

  const items = consultationsQuery.data?.items ?? [];
  const completedCount = items.filter((item) => item.isCompleted).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Consultation oversight"
        description="Use this dashboard to monitor how consultation records are progressing across students."
      />
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Visible consultations</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">
              {consultationsQuery.data?.total ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Completed in current slice</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">
              {completedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-brand-blue text-white">
          <CardContent className="p-6">
            <p className="text-sm text-white/80">Read-only policy</p>
            <p className="mt-2 text-lg font-semibold">
              Admin access is intentionally observational in the client.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
