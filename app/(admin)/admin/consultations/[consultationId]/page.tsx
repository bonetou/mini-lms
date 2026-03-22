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
  const studentName = [
    consultation.studentProfile?.firstName ?? consultation.studentFirstName,
    consultation.studentProfile?.lastName ?? consultation.studentLastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Consultation details"
        description="Review the full consultation record and its audit trail."
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
            <div className="grid gap-4 rounded-[1.5rem] bg-brand-cream p-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Student name</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {studentName || "Unknown student"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student email</p>
                <p className="mt-2 text-base text-foreground">
                  {consultation.studentProfile?.email ?? "No email available"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="mt-2 break-all text-sm text-foreground">
                  {consultation.studentId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consultation ID</p>
                <p className="mt-2 break-all text-sm text-foreground">
                  {consultation.id}
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-brand-cream p-5">
              <p className="text-sm text-muted-foreground">Reason</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {consultation.reason}
              </p>
            </div>
            {consultation.cancelledAt ? (
              <div className="grid gap-4 rounded-[1.5rem] bg-brand-cream p-5 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled at</p>
                  <p className="mt-2 text-sm text-foreground">
                    {formatDateTime(consultation.cancelledAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="mt-2 text-sm text-foreground">
                    {consultation.isCompleted ? "Completed" : "Not completed"}
                  </p>
                </div>
                {consultation.cancellationReason ? (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Cancellation reason
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {consultation.cancellationReason}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-brand-cream p-5">
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="mt-2 text-sm text-foreground">
                  {consultation.isCompleted ? "Completed" : "Not completed"}
                </p>
              </div>
            )}
            <div className="grid gap-4 rounded-[1.5rem] bg-brand-cream p-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Created at</p>
                <p className="mt-2 text-sm text-foreground">
                  {formatDateTime(consultation.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="mt-2 text-sm text-foreground">
                  {formatDateTime(consultation.updatedAt)}
                </p>
              </div>
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
