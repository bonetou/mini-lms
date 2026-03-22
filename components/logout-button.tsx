"use client";

import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });
    router.push("/auth/login");
  };

  return <Button onClick={logout}>Logout</Button>;
}
