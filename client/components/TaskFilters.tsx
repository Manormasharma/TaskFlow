"use client";

import type { Project, Sprint, Task } from "@/types";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/format";
import { Card, Input, Select } from "./ui";

export interface TaskFilterState {
  search: string;
  project: string; // "all" or a project id
  status: string; // "all" or a TaskStatus
  priority: string; // "all" or a TaskPriority
  sprint: string; // "all", "backlog" or a sprint id
}

export const DEFAULT_FILTERS: TaskFilterState = {
  search: "",
  project: "all",
  status: "all",
  priority: "all",
  sprint: "all",
};

export function applyFilters(tasks: Task[], f: TaskFilterState): Task[] {
  const q = f.search.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      (!q || t.title.toLowerCase().includes(q)) &&
      (f.project === "all" || t.project === f.project) &&
      (f.status === "all" || t.status === f.status) &&
      (f.priority === "all" || t.priority === f.priority) &&
      (f.sprint === "all" || (f.sprint === "backlog" ? t.sprint === null : t.sprint === f.sprint)),
  );
}

interface Props {
  value: TaskFilterState;
  onChange: (next: TaskFilterState) => void;
  sprints: Sprint[];
  projects?: Project[]; // show a project filter when provided
}

export default function TaskFilters({ value, onChange, sprints, projects }: Props) {
  const set = (patch: Partial<TaskFilterState>) => onChange({ ...value, ...patch });

  const visibleSprints = value.project === "all" ? sprints : sprints.filter((s) => s.project === value.project);
  const showProjectInLabel = !!projects && value.project === "all";
  const sprintOptions: Record<string, string> = { all: "All", backlog: "Backlog" };
  for (const s of visibleSprints) {
    const projectName = showProjectInLabel ? projects.find((p) => p._id === s.project)?.name : undefined;
    sprintOptions[s._id] = projectName ? `${projectName} / ${s.name}` : s.name;
  }

  return (
    <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Input id="f-search" label="Search" value={value.search} onChange={(e) => set({ search: e.target.value })} />
      {projects && (
        <Select id="f-project" label="Project" value={value.project}
          options={{ all: "All", ...Object.fromEntries(projects.map((p) => [p._id, p.name])) }}
          onChange={(e) => set({ project: e.target.value, sprint: "all" })} />
      )}
      <Select id="f-status" label="Status" value={value.status} options={{ all: "All", ...STATUS_LABEL }}
        onChange={(e) => set({ status: e.target.value })} />
      <Select id="f-priority" label="Priority" value={value.priority} options={{ all: "All", ...PRIORITY_LABEL }}
        onChange={(e) => set({ priority: e.target.value })} />
      <Select id="f-sprint" label="Sprint" value={value.sprint} options={sprintOptions}
        onChange={(e) => set({ sprint: e.target.value })} />
    </Card>
  );
}
