import { EmptyState } from "@/components/empty-state";

export default function NotFoundUtilityPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl items-center">
      <EmptyState
        title="Route not found"
        description="This utility page mirrors the branded missing-page state used across the app."
        actionHref="/"
        actionLabel="Return home"
      />
    </main>
  );
}
