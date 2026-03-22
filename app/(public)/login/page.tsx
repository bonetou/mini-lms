import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-panel">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
