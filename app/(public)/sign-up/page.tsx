import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2.25rem] border border-border bg-card/80 px-8 py-12 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-blue">
          Create Your Account
        </p>
        <h1 className="mt-4 font-display text-5xl text-foreground">
          Start scheduling consultations with a cleaner workflow.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
          Students can create an account, request support, and keep a clear
          record of every consultation change in one place.
        </p>
      </div>
      <SignUpForm />
    </main>
  );
}
