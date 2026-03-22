"use client";

import { useRouter } from "next/navigation";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { PageHeader } from "@/components/page-header";
import { useCreateConsultationMutation } from "@/lib/query/consultations";

export default function NewConsultationPage() {
  const router = useRouter();
  const createMutation = useCreateConsultationMutation();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Create"
        title="Book a new consultation"
        description="Capture the reason clearly and pick a time that works for your support session."
      />
      <ConsultationForm
        title="New consultation"
        description="This creates a scheduled consultation tied to your profile snapshot."
        submitLabel="Create consultation"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          const created = await createMutation.mutateAsync(values);
          router.push(`/dashboard/consultations/${created.id}`);
        }}
      />
    </div>
  );
}
