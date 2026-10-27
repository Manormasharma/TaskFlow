import Link from "next/link";
import { Calendar } from "lucide-react";
import type { Task, TaskStatus } from "@/types";
import { formatDate, isOverdue, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/format";
import { Badge } from "./ui";

const statusTone = { todo: "slate", in_progress: "blue", completed: "green" } as const;
const priorityTone = { low: "slate", medium: "amber", high: "red" } as const;

export function TaskBadges({ task }: { task: Task }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={statusTone[task.status]}>{STATUS_LABEL[task.status]}</Badge>
      <Badge tone={priorityTone[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
      {isOverdue(task) && <Badge tone="red">Overdue</Badge>}
    </div>
  );
}

function DueDate({ task }: { task: Task }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Calendar size={14} /> {formatDate(task.dueDate)}
    </span>
  );
}

const rowClass =
  "block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow focus-visible:outline-2 focus-visible:outline-indigo-600";

export default function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link href={`/tasks/${task.id}`} className={rowClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium text-slate-900">{task.title}</h3>
              <DueDate task={task} />
            </div>
            <div className="mt-2">
              <TaskBadges task={task} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const columns = Object.keys(STATUS_LABEL) as TaskStatus[];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        return (
          <section key={status} className="rounded-2xl bg-slate-100 p-3">
            <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-slate-700">
              {STATUS_LABEL[status]}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">{items.length}</span>
            </h3>
            <ul className="space-y-2">
              {items.map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks/${task.id}`} className={rowClass}>
                    <h4 className="mb-2 text-sm font-medium text-slate-900">{task.title}</h4>
                    <div className="flex items-center justify-between">
                      <Badge tone={priorityTone[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
                      <DueDate task={task} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
