"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/lib/query/auth";
import { LoadingState } from "@/components/loading-state";

export function RoleGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole: "admin";
}) {
  const router = useRouter();
  const meQuery = useMeQuery();

  useEffect(() => {
    if (meQuery.data && !meQuery.data.roles.includes(requiredRole)) {
      router.replace("/forbidden");
    }
  }, [meQuery.data, requiredRole, router]);

  if (meQuery.isPending) {
    return (
      <LoadingState
        title="Checking access"
        description="Verifying your role for this section."
      />
    );
  }

  if (!meQuery.data?.roles.includes(requiredRole)) {
    return (
      <LoadingState
        title="Redirecting"
        description="This area is limited to administrators."
      />
    );
  }

  return <>{children}</>;
}
