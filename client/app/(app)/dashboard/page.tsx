"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ListTodo, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import TaskList from "@/components/TaskList";
import TasksState from "@/components/TasksState";
import { useTasks } from "@/components/useTasks";
import { ButtonLink, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { isOverdue } from "@/lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading, error, unavailable, reload } = useTasks();

  const hasData = !loading && !error && !unavailable;
  const count = (n: number) => (hasData ? String(n) : "—");

  const completed = tasks.filter((t) => t.status === "completed").length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const stats = [
    { label: "Total tasks", value: count(tasks.length), icon: <ListTodo size={22} />, tone: "bg-indigo-100 text-indigo-600" },
    { label: "Completed", value: count(completed), icon: <CheckCircle2 size={22} />, tone: "bg-green-100 text-green-600" },
    { label: "Pending", value: count(tasks.length - completed), icon: <Clock size={22} />, tone: "bg-amber-100 text-amber-600" },
    { label: "Overdue", value: count(tasks.filter(isOverdue).length), icon: <AlertTriangle size={22} />, tone: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, ${user?.full_name.split(" ")[0]}`} subtitle="Here is an overview of your work.">
        <ButtonLink href="/tasks"><Plus size={16} className="mr-1" /> New task</ButtonLink>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent tasks</h2>
            <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
          </div>
          <TasksState loading={loading} error={error} unavailable={unavailable} onRetry={reload} />
          {hasData &&
            (tasks.length ? (
              <TaskList tasks={tasks.slice(0, 5)} />
            ) : (
              <EmptyState title="No tasks yet" text="Create your first task to get started." />
            ))}
        </section>

        <Card className="h-fit">
          <h2 className="font-semibold text-slate-900">Overall progress</h2>
          <p className="mt-3 text-3xl font-bold text-slate-900">{hasData ? `${percent}%` : "—"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${hasData ? percent : 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Share of tasks marked completed.</p>
        </Card>
      </div>
    </div>
  );
}
