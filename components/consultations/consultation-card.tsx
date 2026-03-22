import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConsultationSummary } from "@/lib/types/frontend";

type ConsultationCardProps = {
  consultation: ConsultationSummary;
  href: string;
};

export function ConsultationCard({
  consultation,
  href,
}: ConsultationCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="transition-transform duration-200 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
                Consultation
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-foreground">
                {consultation.studentFirstName} {consultation.studentLastName}
              </h3>
            </div>
            <StatusBadge status={consultation.status} />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            {consultation.reason}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CalendarDays className="h-4 w-4 text-brand-blue" />
              {new Date(consultation.scheduledAt).toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy">
              View
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
