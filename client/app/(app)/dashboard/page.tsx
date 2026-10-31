"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, FolderKanban, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWorkspace } from "@/components/useWorkspace";
import {
  Badge, ButtonLink, Card, EmptyState, ErrorState, ListSkeleton, PageHeader, ProgressBar, StatCard,
} from "@/components/ui";
import {
  formatDate, isOverdue, progressOf, PRIORITY_LABEL, PRIORITY_TONE, PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE,
} from "@/lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useWorkspace();

  const tasks = data?.tasks ?? [];
  const overall = progressOf(tasks);
  const stat = (n: number) => (data ? String(n) : "—");

  const stats = [
    { label: "Active projects", value: stat(data?.projects.filter((p) => p.status === "active").length ?? 0), icon: <FolderKanban size={22} />, tone: "bg-indigo-100 text-indigo-600" },
    { label: "Completed tasks", value: stat(overall.done), icon: <CheckCircle2 size={22} />, tone: "bg-green-100 text-green-600" },
    { label: "Open tasks", value: stat(overall.total - overall.done), icon: <Clock size={22} />, tone: "bg-amber-100 text-amber-600" },
    { label: "Overdue", value: stat(tasks.filter(isOverdue).length), icon: <AlertTriangle size={22} />, tone: "bg-red-100 text-red-600" },
  ];

  const activeSprints = data?.sprints.filter((s) => s.status === "active") ?? [];
  const upcoming = tasks
    .filter((t) => t.status !== "done" && t.dueDate)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, ${user?.full_name.split(" ")[0]}`} subtitle="Here is an overview of your work.">
        <ButtonLink href="/projects"><Plus size={16} className="mr-1" /> New project</ButtonLink>
      </PageHeader>

      {error && <ErrorState message={error} onRetry={reload} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {loading && !data && <ListSkeleton rows={3} />}

      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Projects</h2>
              <Link href="/projects" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
            </div>
            {data.projects.length ? (
              <ul className="space-y-3">
                {data.projects.slice(0, 5).map((p) => {
                  const pr = progressOf(tasks.filter((t) => t.project === p._id));
                  return (
                    <li key={p._id}>
                      <Card className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Link href={`/projects/${p._id}`} className="font-medium text-slate-900 hover:text-indigo-700 hover:underline">{p.name}</Link>
                          <Badge tone={PROJECT_STATUS_TONE[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
                        </div>
                        <ProgressBar percent={pr.percent} label={`${p.name} progress`} />
                        <p className="text-xs text-slate-500">{pr.done} of {pr.total} tasks done</p>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No projects yet" text="Create your first project to get started.">
                <ButtonLink href="/projects">Go to projects</ButtonLink>
              </EmptyState>
            )}
          </section>

          <div className="space-y-6">
            <Card>
              <h2 className="font-semibold text-slate-900">Overall progress</h2>
              <p className="mt-3 text-3xl font-bold text-slate-900">{overall.percent}%</p>
              <div className="mt-3"><ProgressBar percent={overall.percent} label="Overall progress" /></div>
              <p className="mt-2 text-xs text-slate-500">Share of all tasks marked done.</p>
            </Card>

            <Card className="space-y-3">
              <h2 className="font-semibold text-slate-900">Active sprints</h2>
              {activeSprints.length ? (
                activeSprints.map((s) => {
                  const sp = progressOf(tasks.filter((t) => t.sprint === s._id));
                  return (
                    <div key={s._id} className="space-y-1">
                      <Link href={`/projects/${s.project}`} className="text-sm font-medium text-slate-900 hover:underline">{s.name}</Link>
                      <ProgressBar percent={sp.percent} label={`${s.name} progress`} />
                      <p className="text-xs text-slate-500">Ends {formatDate(s.endDate)} · {sp.percent}% done</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No active sprints.</p>
              )}
            </Card>

            <Card className="space-y-3">
              <h2 className="font-semibold text-slate-900">Upcoming deadlines</h2>
              {upcoming.length ? (
                <ul className="space-y-2">
                  {upcoming.map((t) => (
                    <li key={t._id} className="flex items-center justify-between gap-2 text-sm">
                      <Link href={`/tasks/${t._id}`} className="truncate text-slate-900 hover:underline">{t.title}</Link>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                        <span className={isOverdue(t) ? "text-red-600" : "text-slate-500"}>{formatDate(t.dueDate)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Nothing due.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
