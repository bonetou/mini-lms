import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/80 p-8 shadow-panel lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-blue">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
