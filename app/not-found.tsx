import { EmptyState } from "@/components/empty-state";

export default function GlobalNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4">
      <EmptyState
        title="This page does not exist."
        description="The route you requested could not be found."
        actionHref="/"
        actionLabel="Go home"
      />
    </main>
  );
}
