import Link from "next/link";
import { BarChart3, CheckCircle2, Clock, Filter, LayoutGrid, ListChecks } from "lucide-react";
import { Logo } from "@/components/AppShell";
import { Badge, ButtonLink, Card } from "@/components/ui";

const features = [
  { icon: ListChecks, title: "Organize tasks", text: "Keep every task in one place with clear status and priority." },
  { icon: Filter, title: "Find what matters", text: "Search, filter and sort to focus on the work that needs you now." },
  { icon: LayoutGrid, title: "List and board views", text: "Switch between a simple list and a Kanban-style board." },
  { icon: BarChart3, title: "Track progress", text: "See completed, pending and overdue work at a glance." },
];

const previewTasks = [
  ["Prepare Q4 roadmap", "In progress", "blue"],
  ["Review onboarding flow", "To do", "slate"],
  ["Publish release notes", "Completed", "green"],
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex gap-2">
            <ButtonLink href="/login" variant="secondary">Log In</ButtonLink>
            <ButtonLink href="/register">Get Started</ButtonLink>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-indigo-50 to-white">
          <div className="mx-auto max-w-6xl px-4 pb-8 pt-16 text-center sm:pt-24">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              Task management for teams
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Get your team&apos;s work done, together
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              TaskFlow gives your organisation one clear place to plan work, set priorities and track progress.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <ButtonLink href="/register">Get Started</ButtonLink>
              <ButtonLink href="/login" variant="secondary">Log In</ButtonLink>
            </div>
          </div>

          <div className="mx-auto max-w-4xl px-4 pb-20 pt-10">
            <p className="mb-2 text-center text-xs uppercase tracking-wide text-slate-400">
              Illustration only — not real data
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-3">
                {[["Total", "24", ListChecks], ["Completed", "15", CheckCircle2], ["Pending", "9", Clock]].map(([l, v, Icon]) => {
                  const I = Icon as typeof ListChecks;
                  return (
                    <div key={l as string} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-left">
                      <I className="text-indigo-600" size={22} />
                      <div>
                        <p className="text-xs text-slate-500">{l as string}</p>
                        <p className="text-xl font-semibold text-slate-900">{v as string}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 px-5 pb-5">
                {previewTasks.map(([title, status, tone]) => (
                  <div key={title} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-800">{title}</span>
                    <Badge tone={tone}>{status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-slate-900">Everything you need to stay on track</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to organise your work?</h2>
          <div className="mt-6"><ButtonLink href="/register">Get Started</ButtonLink></div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <Link href="/login" className="hover:underline">Log in</Link>
        {" · "}
        <Link href="/register" className="hover:underline">Register</Link>
        {" · "}© TaskFlow
      </footer>
    </>
  );
}
