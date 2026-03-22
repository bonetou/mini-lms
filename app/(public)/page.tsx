import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featureCards = [
  {
    title: "Book consultations fast",
    description:
      "Students can schedule, reschedule, and track support sessions without juggling email threads.",
    icon: CalendarDays,
  },
  {
    title: "Clear role-based access",
    description:
      "Admins get an oversight layer for consultations while students keep a focused, personal workflow.",
    icon: ShieldCheck,
  },
  {
    title: "Purposeful experience",
    description:
      "A bright Contour-inspired palette keeps the product feeling academic, modern, and confident.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2.5rem] bg-secondary px-8 py-12 text-secondary-foreground shadow-panel md:px-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-cream/75">
            Consultation Platform
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-white md:text-7xl">
            Book, manage, and audit student consultations in one place.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-brand-cream/80">
            Mini LMS is now structured around student and admin workflows, with
            role-aware dashboards, consultation history, and a calm academic
            visual language.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-brand-white/20 bg-transparent text-white hover:bg-brand-white/10 hover:text-white"
            >
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden bg-brand-cream/70">
          <CardContent className="flex h-full flex-col justify-between p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">
                Snapshot
              </p>
              <h2 className="mt-3 font-display text-4xl text-foreground">
                Built for student support teams.
              </h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.5rem] bg-white p-5">
                <p className="text-sm text-muted-foreground">Student view</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  See upcoming consultations, update timing, and track outcomes.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-brand-blue p-5 text-white">
                <p className="text-sm text-white/70">Admin view</p>
                <p className="mt-2 text-lg font-semibold">
                  Read every consultation and follow the status history clearly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardContent className="p-8">
                <div className="inline-flex rounded-2xl bg-brand-blue/10 p-3 text-brand-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-3xl text-foreground">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
