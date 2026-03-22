import { ReactNode } from "react";
import { PublicHeader } from "@/components/public-header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <div className="px-4 pb-10 md:px-6">{children}</div>
    </div>
  );
}
