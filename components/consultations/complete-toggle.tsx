"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompleteToggleProps = {
  isCompleted: boolean;
  isPending?: boolean;
  onToggle: (nextValue: boolean) => void;
};

export function CompleteToggle({
  isCompleted,
  isPending = false,
  onToggle,
}: CompleteToggleProps) {
  return (
    <Button
      type="button"
      variant={isCompleted ? "secondary" : "outline"}
      disabled={isPending}
      onClick={() => onToggle(!isCompleted)}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {isPending
        ? "Saving..."
        : isCompleted
          ? "Mark as incomplete"
          : "Mark as complete"}
    </Button>
  );
}
