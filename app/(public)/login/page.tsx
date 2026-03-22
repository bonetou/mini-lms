import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2.25rem] bg-secondary px-8 py-12 text-secondary-foreground shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-cream/75">
          Student & Admin Access
        </p>
        <h1 className="mt-4 font-display text-5xl text-white">
          Log in and continue your consultation workflow.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-brand-cream/80">
          Access your dashboard, open consultation history, and move from
          scheduling to completion without leaving the platform.
        </p>
      </div>
      <Suspense fallback={<div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-panel">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
