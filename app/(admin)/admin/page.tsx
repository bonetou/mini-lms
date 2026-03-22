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
    search: "",
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow=""
        title="Dashboard"
        description="Analytics details"
      />
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Consultations</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">
              {consultationsQuery.data?.total ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
