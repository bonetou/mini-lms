import Link from "next/link";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border/80 bg-card/80 px-6 py-4 shadow-panel">
          <Link href="/login" className="text-lg font-semibold text-brand-navy">
            Mini LMS
          </Link>
        </div>
      </header>
      <div className="px-4 pb-10 md:px-6">{children}</div>
    </div>
  );
}
