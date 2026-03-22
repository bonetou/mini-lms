"use client";

import { useParams } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { useConsultationQuery } from "@/lib/query/consultations";

export default function AdminConsultationDetailPage() {
  const params = useParams<{ consultationId: string }>();
  const consultationQuery = useConsultationQuery(params.consultationId, {
    admin: true,
  });

  if (consultationQuery.isPending || !consultationQuery.data) {
    return (
      <LoadingState
        title="Loading consultation"
        description="Preparing the audit view for this record."
      />
    );
  }

  const consultation = consultationQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Detail"
        title={`${consultation.studentFirstName} ${consultation.studentLastName}`}
        description={consultation.reason}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="space-y-5 p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Current status</p>
              <StatusBadge status={consultation.status} />
            </div>
            <div className="rounded-[1.5rem] bg-brand-cream p-5">
                <p className="text-sm text-muted-foreground">Scheduled time</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatDateTime(consultation.scheduledAt)}
                </p>
              </div>
            <div className="rounded-[1.5rem] bg-brand-cream p-5">
              <p className="text-sm text-muted-foreground">Student profile</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {consultation.studentProfile?.firstName}{" "}
                {consultation.studentProfile?.lastName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {consultation.studentProfile?.email}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
              Audit history
            </p>
            <div className="mt-6 space-y-4">
              {consultation.statusHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.5rem] border border-border bg-background p-4"
                >
                  <p className="font-medium text-foreground">
                    {entry.fromStatus ?? "Start"} → {entry.toStatus}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)}
                  </p>
                  {entry.notes ? (
                    <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
