"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Button, EmptyState, ErrorState, ListSkeleton, Modal, PageHeader } from "@/components/ui";
import TaskForm from "@/components/TaskForm";
import TaskFilters, { applyFilters, DEFAULT_FILTERS } from "@/components/TaskFilters";
import TaskList, { TaskBoard } from "@/components/TaskList";
import { useToast } from "@/components/ToastProvider";
import { useTaskActions } from "@/components/useTaskActions";
import { useWorkspace } from "@/components/useWorkspace";
import { createTask } from "@/lib/tasks";

export default function TasksPage() {
  const { data, loading, error, reload, mutate } = useWorkspace();
  const toast = useToast();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState<"list" | "board">("board");
  const [creating, setCreating] = useState(false);

  const actions = useTaskActions((updated) =>
    mutate((w) => ({ ...w, tasks: w.tasks.map((t) => (t._id === updated._id ? updated : t)) })),
  );

  const visible = data ? applyFilters(data.tasks, filters) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" subtitle="Every task across all of your projects.">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView(view === "list" ? "board" : "list")}>
            {view === "list" ? <LayoutGrid size={16} className="mr-1" /> : <List size={16} className="mr-1" />}
            {view === "list" ? "Board" : "List"} view
          </Button>
          <Button onClick={() => setCreating(true)} disabled={!data?.projects.length}>
            <Plus size={16} className="mr-1" /> New task
          </Button>
        </div>
      </PageHeader>

      {data && (
        <TaskFilters value={filters} onChange={setFilters} sprints={data.sprints} projects={data.projects} />
      )}

      {loading && !data && <ListSkeleton />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data &&
        (!data.projects.length ? (
          <EmptyState title="No projects yet" text="Tasks belong to a project. Create a project first." />
        ) : visible.length || view === "board" ? (
          view === "board" ? (
            <TaskBoard tasks={visible} sprints={data.sprints} projects={data.projects} {...actions} />
          ) : (
            <TaskList tasks={visible} sprints={data.sprints} projects={data.projects} {...actions} />
          )
        ) : (
          <EmptyState title="No tasks found" text={data.tasks.length ? "Try changing your filters." : "Create your first task."} />
        ))}

      {creating && data && (
        <Modal title="New task" onClose={() => setCreating(false)}>
          <TaskForm
            projects={data.projects}
            defaultProjectId={filters.project === "all" ? "" : filters.project}
            sprints={data.sprints}
            submitLabel="Create task"
            onCancel={() => setCreating(false)}
            onSubmit={async (projectId, values) => {
              const created = await createTask(projectId, values);
              mutate((w) => ({ ...w, tasks: [created, ...w.tasks] }));
              setCreating(false);
              toast("Task created");
            }}
          />
        </Modal>
      )}
    </div>
  );
}
