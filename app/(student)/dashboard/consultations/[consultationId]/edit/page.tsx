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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edit"
        title="Update consultation details"
        description="Adjust the scheduled time or refine the reason while keeping the consultation record intact."
      />
      <ConsultationForm
        title="Edit consultation"
        description="Status changes stay in the dedicated actions. This form only updates the editable fields."
        submitLabel="Save changes"
        initialValues={{
          reason: consultationQuery.data.reason,
          scheduledAt: consultationQuery.data.scheduledAt,
        }}
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
          router.push(`/dashboard/consultations/${consultationId}`);
        }}
      />
    </div>
  );
}
