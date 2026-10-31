import type { ProjectStatus, SprintStatus, Task, TaskPriority, TaskStatus } from "@/types";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const SPRINT_STATUS_LABEL: Record<SprintStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
};

export const TASK_STATUS_TONE = { todo: "slate", "in-progress": "blue", done: "green" } as const;
export const PRIORITY_TONE = { low: "slate", medium: "amber", high: "red" } as const;
export const PROJECT_STATUS_TONE = { active: "blue", completed: "green", archived: "slate" } as const;
export const SPRINT_STATUS_TONE = { planned: "slate", active: "blue", completed: "green" } as const;

// Dates from the API are date-only values stored at UTC midnight, so format in UTC
// to avoid showing the previous day in timezones behind UTC.
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
}

// <input type="date"> value (YYYY-MM-DD) from an API date.
export const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

// ISO datetime (UTC midnight) from a YYYY-MM-DD value; null for empty.
export const fromDateInput = (value: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;

export function isOverdue(task: Task): boolean {
  return task.status !== "done" && !!task.dueDate && new Date(task.dueDate).getTime() < Date.now();
}

export function progressOf(tasks: Task[]) {
  const done = tasks.filter((t) => t.status === "done").length;
  return { done, total: tasks.length, percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}
