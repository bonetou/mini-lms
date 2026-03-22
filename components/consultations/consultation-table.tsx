import Link from "next/link";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatDateOnly, formatDateTime } from "@/lib/dates";
import { ConsultationSummary } from "@/lib/types/frontend";

type ConsultationTableProps = {
  consultations: ConsultationSummary[];
  detailBasePath: string;
  showStudentColumn?: boolean;
};

export function ConsultationTable({
  consultations,
  detailBasePath,
  showStudentColumn = false,
}: ConsultationTableProps) {
  const columns: DataTableColumn<ConsultationSummary>[] = [
    ...(showStudentColumn
      ? [
          {
            id: "student",
            header: "Student",
            cell: (consultation: ConsultationSummary) => (
              <div>
                <p className="font-medium text-foreground">
                  {consultation.studentFirstName} {consultation.studentLastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {consultation.studentId}
                </p>
              </div>
            ),
          } satisfies DataTableColumn<ConsultationSummary>,
        ]
      : []),
    {
      id: "reason",
      header: "Reason",
      cell: (consultation) => (
        <div>
          <p className="font-medium text-foreground">{consultation.reason}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {formatDateOnly(consultation.createdAt)}
          </p>
        </div>
      ),
    },
    {
      id: "scheduledAt",
      header: "Scheduled",
      cell: (consultation) => <span>{formatDateTime(consultation.scheduledAt)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (consultation) => <StatusBadge status={consultation.status} />,
    },
    {
      id: "actions",
      header: "Details",
      className: "text-right",
      cell: (consultation) => (
        <Link
          href={`${detailBasePath}/${consultation.id}`}
          className="font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          Open
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={consultations}
      getRowKey={(consultation) => consultation.id}
      emptyMessage="No consultations matched the current filters."
    />
  );
}
