"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { useMeQuery } from "@/lib/query/auth";
import { LoadingState } from "@/components/loading-state";

type ProtectedRouteGuardProps = {
  children: ReactNode;
  redirectIfAdminTo?: string;
};

export function ProtectedRouteGuard({
  children,
  redirectIfAdminTo,
}: ProtectedRouteGuardProps) {
  const router = useRouter();
  const meQuery = useMeQuery();

  useEffect(() => {
    if (
      meQuery.error instanceof ApiClientError &&
      meQuery.error.status === 401
    ) {
      router.replace("/login");
    }

    if (redirectIfAdminTo && meQuery.data?.isAdmin) {
      router.replace(redirectIfAdminTo);
    }
  }, [meQuery.data?.isAdmin, meQuery.error, redirectIfAdminTo, router]);

  if (meQuery.isPending) {
    return (
      <LoadingState
        title="Checking session"
        description="Confirming your access before rendering the dashboard."
      />
    );
  }

  if (
    meQuery.error instanceof ApiClientError &&
    meQuery.error.status === 401
  ) {
    return (
      <LoadingState
        title="Redirecting"
        description="Your session is missing, so we are returning you to login."
      />
    );
  }

  if (meQuery.error) {
    return (
      <LoadingState
        title="Unable to load account"
        description="Please refresh and try again."
      />
    );
  }

  if (redirectIfAdminTo && meQuery.data?.isAdmin) {
    return (
      <LoadingState
        title="Redirecting"
        description="Admin accounts are sent to the admin console instead of the student dashboard."
      />
    );
  }

  return <>{children}</>;
}
