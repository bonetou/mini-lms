"use client";

import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CancelConsultationDialogProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
};

export function CancelConsultationDialog({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CancelConsultationDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit(reason);
      onClose();
    } catch (submitError) {
      if (submitError instanceof ApiClientError) {
        setError(submitError.message);
        return;
      }

      setError("Unable to cancel this consultation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/45 px-4">
      <div className="w-full max-w-lg rounded-[1.75rem] bg-card p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-destructive">
          Cancel
        </p>
        <h3 className="mt-3 font-display text-3xl text-foreground">
          Cancel this consultation?
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          The record stays in history, but the status will switch to cancelled.
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-2">
            <Label htmlFor="cancellation-reason">Reason for cancellation</Label>
            <textarea
              id="cancellation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-28 rounded-3xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
              placeholder="Share the context for this cancellation."
            />
          </div>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Keep it
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Cancelling..." : "Cancel consultation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
