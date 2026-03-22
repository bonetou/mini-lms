import { cn } from "@/lib/utils";

type LoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({
  title = "Loading",
  description = "Fetching the latest data.",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-dashed border-border bg-card/70 p-8 text-center shadow-panel",
        className,
      )}
    >
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
