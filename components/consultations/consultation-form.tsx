"use client";

import { useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  dateTimeInputToIso,
  toDateTimeInputValue,
} from "@/lib/dates";

type ConsultationFormValues = {
  reason: string;
  scheduledAt: string;
};

type ConsultationFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: ConsultationFormValues;
  onSubmit: (values: ConsultationFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

export function ConsultationForm({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ConsultationFormProps) {
  const [reason, setReason] = useState(initialValues?.reason ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initialValues?.scheduledAt
      ? toDateTimeInputValue(initialValues.scheduledAt)
      : "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit({
        reason,
        scheduledAt: dateTimeInputToIso(scheduledAt),
      });
    } catch (submitError) {
      if (submitError instanceof ApiClientError) {
        setError(submitError.message);
        return;
      }

      setError("Unable to save the consultation right now.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-border bg-card p-8 shadow-panel"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
          Consultation Form
        </p>
        <h2 className="mt-3 font-display text-3xl text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="scheduled-at">Scheduled date and time</Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reason">Reason</Label>
          <textarea
            id="reason"
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-32 rounded-3xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
            placeholder="What should the consultation focus on?"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
