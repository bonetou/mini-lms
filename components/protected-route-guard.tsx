"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { useMeQuery } from "@/lib/query/auth";
import { LoadingState } from "@/components/loading-state";

export function ProtectedRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const meQuery = useMeQuery();

  useEffect(() => {
    if (
      meQuery.error instanceof ApiClientError &&
      meQuery.error.status === 401
    ) {
      router.replace("/login");
    }
  }, [meQuery.error, router]);

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

  return <>{children}</>;
}
