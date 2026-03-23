"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CancelConsultationDialog } from "@/components/consultations/cancel-consultation-dialog";
import { CompleteToggle } from "@/components/consultations/complete-toggle";
import { RescheduleDialog } from "@/components/consultations/reschedule-dialog";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingModal } from "@/lib/contexts/booking-modal-context";
import { formatDateTime } from "@/lib/dates";
import {
  useCancelConsultationMutation,
  useConsultationQuery,
  useRescheduleConsultationMutation,
  useToggleConsultationCompleteMutation,
} from "@/lib/query/consultations";

export default function ConsultationDetailPage() {
  const params = useParams<{ consultationId: string }>();
  const consultationId = params.consultationId;
  const consultationQuery = useConsultationQuery(consultationId);
  const rescheduleMutation = useRescheduleConsultationMutation(consultationId);
  const cancelMutation = useCancelConsultationMutation(consultationId);
  const toggleMutation = useToggleConsultationCompleteMutation(consultationId);
  const bookingModal = useBookingModal();

  if (consultationQuery.isPending || !consultationQuery.data) {
    return (
      <LoadingState
        title="Loading consultation"
        description="Gathering the consultation record and history."
      />
    );
  }

  const consultation = consultationQuery.data;
  const isCancelled = consultation.status === "CANCELLED";
  const studentName = [
    consultation.studentProfile?.firstName ?? consultation.studentFirstName,
    consultation.studentProfile?.lastName ?? consultation.studentLastName,
  ]
    .filter(Boolean)
    .join(" ");
  const isRescheduleOpen =
    bookingModal.isOpen &&
    bookingModal.mode === "reschedule" &&
    bookingModal.consultationId === consultationId;
  const isCancelOpen =
    bookingModal.isOpen &&
    bookingModal.mode === "cancel" &&
    bookingModal.consultationId === consultationId;
  const completionPanel = consultation.cancelledAt ? (
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
          <p className="text-sm text-muted-foreground">Cancellation reason</p>
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
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Consultation"
        title="Consultation details"
        description="Review your consultation record, manage its schedule, and track status changes."
        actions={
          <>
            {isCancelled ? (
              <Button variant="outline" disabled>
                Edit details
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={`/dashboard/consultations/${consultationId}/edit`}>
                  Edit details
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              disabled={isCancelled}
              onClick={() => bookingModal.openModal("reschedule", consultationId)}
            >
              Reschedule
            </Button>
            <Button
              variant="destructive"
              disabled={isCancelled}
              onClick={() => bookingModal.openModal("cancel", consultationId)}
            >
              Cancel
            </Button>
          </>
        }
      />

      {isCancelled ? (
        <p className="rounded-[1.5rem] border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          Cancelled consultations are locked. You can still review the record and
          audit history, but editing, rescheduling, cancelling again, and
          completion changes are disabled.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="space-y-5 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current status</p>
                <div className="mt-3">
                  <StatusBadge status={consultation.status} />
                </div>
              </div>
              <CompleteToggle
                isCompleted={consultation.isCompleted}
                disabled={isCancelled}
                isPending={toggleMutation.isPending}
                onToggle={(nextValue) =>
                  toggleMutation.mutate({ isCompleted: nextValue })
                }
              />
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
            {completionPanel}
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

      <RescheduleDialog
        isOpen={isRescheduleOpen}
        initialValue={consultation.scheduledAt}
        isSubmitting={rescheduleMutation.isPending}
        onClose={bookingModal.closeModal}
        onSubmit={async (scheduledAt) => {
          await rescheduleMutation.mutateAsync({ scheduledAt });
        }}
      />
      <CancelConsultationDialog
        isOpen={isCancelOpen}
        isSubmitting={cancelMutation.isPending}
        onClose={bookingModal.closeModal}
        onSubmit={async (cancellationReason) => {
          await cancelMutation.mutateAsync({ cancellationReason });
        }}
      />
    </div>
  );
}
