"use client";

import { useEffect, useState } from "react";
import {
  ApiClientError,
  getApiErrorMessage,
  getValidationErrors,
} from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  dateTimeInputToIso,
  toDateTimeInputValue,
} from "@/lib/dates";

type RescheduleDialogProps = {
  isOpen: boolean;
  initialValue: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (scheduledAt: string) => Promise<void>;
};

export function RescheduleDialog({
  isOpen,
  initialValue,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RescheduleDialogProps) {
  const [scheduledAt, setScheduledAt] = useState(toDateTimeInputValue(initialValue));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setScheduledAt(toDateTimeInputValue(initialValue));
  }, [initialValue]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      await onSubmit(dateTimeInputToIso(scheduledAt));
      onClose();
    } catch (submitError) {
      if (submitError instanceof ApiClientError) {
        const validationErrors = getValidationErrors(submitError);
        setFieldErrors(validationErrors.fieldErrors);
        setError(getApiErrorMessage(submitError));
        return;
      }

      setError("Unable to reschedule this consultation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/45 px-4">
      <div className="w-full max-w-lg rounded-[1.75rem] bg-card p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
          Reschedule
        </p>
        <h3 className="mt-3 font-display text-3xl text-foreground">
          Pick a new time
        </h3>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-2">
            <Label htmlFor="reschedule-at">New date and time</Label>
            <Input
              id="reschedule-at"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className={fieldErrors.scheduledAt ? "border-destructive" : undefined}
            />
            {fieldErrors.scheduledAt?.map((message) => (
              <p key={message} className="text-sm text-destructive">
                {message}
              </p>
            ))}
          </div>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Reschedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
