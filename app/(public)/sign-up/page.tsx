import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl justify-center px-4 pt-10 md:px-6 md:pt-16">
      <div className="w-full max-w-2xl">
        <SignUpForm className="w-full" />
      </div>
    </main>
  );
}
