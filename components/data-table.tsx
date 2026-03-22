import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "No results found.",
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-panel",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/70">
          <thead className="bg-brand-cream/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={getRowKey(row)} className="align-top">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn("px-6 py-5 text-sm text-foreground", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
