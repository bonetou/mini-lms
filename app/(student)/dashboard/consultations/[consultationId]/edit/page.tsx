"use client";

import { useParams, useRouter } from "next/navigation";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import {
  useConsultationQuery,
  useUpdateConsultationMutation,
} from "@/lib/query/consultations";

export default function EditConsultationPage() {
  const params = useParams<{ consultationId: string }>();
  const router = useRouter();
  const consultationId = params.consultationId;
  const consultationQuery = useConsultationQuery(consultationId);
  const updateMutation = useUpdateConsultationMutation(consultationId);

  if (consultationQuery.isPending || !consultationQuery.data) {
    return (
      <LoadingState
        title="Loading consultation"
        description="Preparing the current values for editing."
      />
    );
  }

  const consultation = consultationQuery.data;
  const isCancelled = consultation.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edit"
        title="Update consultation details"
        description="Adjust the scheduled time or refine the reason while keeping the consultation record intact."
      />
      {isCancelled ? (
        <p className="rounded-[1.5rem] border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          Cancelled consultations are locked. You can review the details here,
          but you cannot edit or reschedule them anymore.
        </p>
      ) : null}
      <ConsultationForm
        title="Edit consultation"
        description="Status changes stay in the dedicated actions. This form only updates the editable fields."
        submitLabel="Save changes"
        initialValues={{
          reason: consultation.reason,
          scheduledAt: consultation.scheduledAt,
        }}
        disabled={isCancelled}
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
          router.push(`/dashboard/consultations/${consultationId}`);
        }}
      />
    </div>
  );
}
