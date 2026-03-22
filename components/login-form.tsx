"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiClientError } from "@/lib/api/client";
import { useLoginMutation } from "@/lib/query/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  const registered = searchParams.get("registered") === "1";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      const destination = result.roles.includes("admin")
        ? "/admin"
        : "/dashboard";
      router.replace(destination);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setError(error.message);
      } else {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-border/70 bg-card/90">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
            Welcome Back
          </p>
          <CardTitle className="text-3xl">Login</CardTitle>
          <CardDescription>
            Enter your details to access your dashboard and consultation history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registered ? (
            <div className="mb-6 rounded-3xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-3 text-sm text-brand-navy">
              Your account was created. Sign in to continue.
            </div>
          ) : null}
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-brand-navy underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
