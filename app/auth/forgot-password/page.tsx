import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl justify-center px-4 pt-10 md:px-6 md:pt-16">
      <div className="w-full max-w-xl">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
