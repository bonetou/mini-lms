import { EmptyState } from "@/components/empty-state";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl items-center">
      <EmptyState
        title="This section is off limits."
        description="Your account is authenticated, but it does not have the role required for that route."
        actionHref="/dashboard"
        actionLabel="Return to dashboard"
      />
    </main>
  );
}
