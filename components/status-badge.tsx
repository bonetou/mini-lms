import { Badge } from "@/components/ui/badge";
import { ConsultationStatus } from "@/lib/types/frontend";

const statusCopy: Record<ConsultationStatus, string> = {
  SCHEDULED: "Scheduled",
  RESCHEDULED: "Rescheduled",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const statusClasses: Record<ConsultationStatus, string> = {
  SCHEDULED: "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
  RESCHEDULED: "border-brand-navy/20 bg-brand-navy/10 text-brand-navy",
  CANCELLED: "border-destructive/20 bg-destructive/10 text-destructive",
  COMPLETED: "border-emerald-600/20 bg-emerald-600/10 text-emerald-700",
};

export function StatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {statusCopy[status]}
    </Badge>
  );
}
