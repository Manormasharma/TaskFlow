"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Card, Button, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import TaskForm from "@/components/TaskForm";
import TaskList, { TaskBoard } from "@/components/TaskList";
import TasksState from "@/components/TasksState";
import { useTasks } from "@/components/useTasks";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/format";
import { createTask } from "@/lib/tasks";
import type { TaskInput } from "@/types";

const SORT_LABEL = { newest: "Newest", due: "Due date", priority: "Priority" };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export default function TasksPage() {
  const { tasks, loading, error, unavailable, reload } = useTasks();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"list" | "board">("list");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .filter((t) => status === "all" || t.status === status)
      .filter((t) => priority === "all" || t.priority === priority)
      .sort((a, b) => {
        if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (sort === "due") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, search, status, priority, sort]);

  async function handleCreate(values: TaskInput) {
    await createTask(values); // throws (and the form shows the error) if the backend rejects it
    setCreating(false);
    reload();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" subtitle="Search, filter and manage everything in one place.">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView(view === "list" ? "board" : "list")}>
            {view === "list" ? <LayoutGrid size={16} className="mr-1" /> : <List size={16} className="mr-1" />}
            {view === "list" ? "Board" : "List"} view
          </Button>
          <Button onClick={() => setCreating(true)} disabled={creating}>
            <Plus size={16} className="mr-1" /> New task
          </Button>
        </div>
      </PageHeader>

      {creating && (
        <Card>
          <TaskForm submitLabel="Create task" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </Card>
      )}

      <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input id="search" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select id="f-status" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}
          options={{ all: "All", ...STATUS_LABEL }} />
        <Select id="f-priority" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}
          options={{ all: "All", ...PRIORITY_LABEL }} />
        <Select id="sort" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} options={SORT_LABEL} />
      </Card>

      <TasksState loading={loading} error={error} unavailable={unavailable} onRetry={reload} />
      {!loading && !error && !unavailable &&
        (visible.length ? (
          view === "list" ? <TaskList tasks={visible} /> : <TaskBoard tasks={visible} />
        ) : (
          <EmptyState title="No tasks found" text={tasks.length ? "Try changing your filters." : "Create your first task."} />
        ))}
    </div>
  );
}
