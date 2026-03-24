"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ApiClientError, getApiErrorMessage } from "@/lib/api/client";
import { useForgotPasswordMutation } from "@/lib/query/auth";
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

const RESEND_DELAY_SECONDS = 60;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const pathname = usePathname();
  const forgotPasswordMutation = useForgotPasswordMutation();

  useEffect(() => {
    setEmail("");
    setError(null);
    setSuccess(false);
    setIsLoading(false);
    setResendCooldown(0);
  }, [pathname]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendCooldown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendCooldown]);

  const sendResetEmail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setSuccess(true);
      setResendCooldown(RESEND_DELAY_SECONDS);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setError(getApiErrorMessage(error));
      } else {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendResetEmail();
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) {
      return;
    }

    await sendResetEmail();
  };

  const resendLabel =
    resendCooldown > 0
      ? `Resend in ${Math.floor(resendCooldown / 60)}:${String(
          resendCooldown % 60,
        ).padStart(2, "0")}`
      : "Resend";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
            {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Didn&apos;t receive the email?</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 py-0"
                disabled={resendCooldown > 0 || isLoading}
                onClick={handleResend}
              >
                {isLoading ? "Sending..." : resendLabel}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Go back to{" "}
              <Link
                href="/login"
                className="underline underline-offset-4"
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Type in your email and we&apos;ll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset email"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
