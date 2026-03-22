import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl justify-center px-4 pt-10 md:px-6 md:pt-16">
      <div className="w-full max-w-xl">
        <Suspense
          fallback={
            <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-panel">
              Loading login form...
            </div>
          }
        >
          <LoginForm className="w-full" />
        </Suspense>
      </div>
    </main>
  );
}
