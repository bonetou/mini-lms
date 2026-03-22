"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import { useMeQuery } from "@/lib/query/auth";

type AppShellProps = {
  title: string;
  subtitle: string;
  navItems: Array<{ href: string; label: string }>;
  children: ReactNode;
};

export function AppShell({
  title,
  subtitle,
  navItems,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const meQuery = useMeQuery();
  const firstName = meQuery.data?.profile?.firstName?.trim() ?? "";
  const lastName = meQuery.data?.profile?.lastName?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = meQuery.data?.profile?.email ?? meQuery.data?.user.email ?? "";
  const displayName = fullName || "Member";
  const exactMatch = navItems.find((item) => item.href === pathname)?.href;
  const nestedMatch = [...navItems]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname.startsWith(`${item.href}/`))?.href;
  const activeHref = exactMatch ?? nestedMatch ?? null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full flex-col gap-4 px-2 py-2 lg:flex-row lg:px-3">
        <aside className="rounded-[2rem] bg-secondary p-6 text-secondary-foreground shadow-panel lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-80">
          <div className="flex h-full flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-cream/70">
                Mini LMS
              </p>
              <h1 className="mt-4 font-display text-4xl text-white">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-brand-cream/76">
                {subtitle}
              </p>
            </div>

            <nav className="mt-10 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = item.href === activeHref;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-cream text-brand-navy"
                        : "text-brand-cream/80 hover:bg-brand-white/10 hover:text-brand-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[1rem] p-0">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-cream/70">
                Signed in
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{displayName}</p>
              {email ? (
                <p className="mt-1 text-sm text-brand-cream/75">{email}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 py-2">{children}</main>
      </div>
    </div>
  );
}
