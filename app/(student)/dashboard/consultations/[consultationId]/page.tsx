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
  const isRescheduleOpen =
    bookingModal.isOpen &&
    bookingModal.mode === "reschedule" &&
    bookingModal.consultationId === consultationId;
  const isCancelOpen =
    bookingModal.isOpen &&
    bookingModal.mode === "cancel" &&
    bookingModal.consultationId === consultationId;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Consultation Detail"
        title={`${consultation.studentFirstName} ${consultation.studentLastName}`}
        description={consultation.reason}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/dashboard/consultations/${consultationId}/edit`}>
                Edit details
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => bookingModal.openModal("reschedule", consultationId)}
            >
              Reschedule
            </Button>
            <Button
              variant="destructive"
              onClick={() => bookingModal.openModal("cancel", consultationId)}
            >
              Cancel
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current status</p>
                <div className="mt-3">
                  <StatusBadge status={consultation.status} />
                </div>
              </div>
              <CompleteToggle
                isCompleted={consultation.isCompleted}
                isPending={toggleMutation.isPending}
                onToggle={(nextValue) =>
                  toggleMutation.mutate({ isCompleted: nextValue })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-brand-cream p-5">
                <p className="text-sm text-muted-foreground">Scheduled for</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatDateTime(consultation.scheduledAt)}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-brand-cream p-5">
                <p className="text-sm text-muted-foreground">Created on</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatDateTime(consultation.createdAt)}
                </p>
              </div>
            </div>
            {consultation.cancelledAt ? (
              <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-5">
                <p className="text-sm font-medium text-destructive">
                  Cancelled at {formatDateTime(consultation.cancelledAt)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {consultation.cancellationReason || "No cancellation reason provided."}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
              Status History
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
