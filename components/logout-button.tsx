"use client";

import { useLogoutMutation } from "@/lib/query/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/login");
  };

  return (
    <Button onClick={logout} disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
