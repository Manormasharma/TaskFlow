"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowLeft, LayoutGrid, List, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge, Button, Card, EmptyState, ErrorState, ListSkeleton, Modal, PageHeader, ProgressBar,
  ConfirmDialog, Skeleton,
} from "@/components/ui";
import ProjectForm from "@/components/ProjectForm";
import SprintForm from "@/components/SprintForm";
import TaskForm from "@/components/TaskForm";
import TaskFilters, { applyFilters, DEFAULT_FILTERS } from "@/components/TaskFilters";
import TaskList, { TaskBoard } from "@/components/TaskList";
import { useToast } from "@/components/ToastProvider";
import { useResource } from "@/components/useResource";
import { useTaskActions } from "@/components/useTaskActions";
import { errorMessage } from "@/lib/api";
import {
  formatDate, progressOf, PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE, SPRINT_STATUS_LABEL, SPRINT_STATUS_TONE,
} from "@/lib/format";
import { deleteProject, getProject, updateProject } from "@/lib/projects";
import { createSprint, deleteSprint, listProjectSprints, updateSprint } from "@/lib/sprints";
import { createTask, listProjectTasks } from "@/lib/tasks";
import type { Sprint } from "@/types";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const toast = useToast();

  const projectFetcher = useCallback(() => getProject(projectId), [projectId]);
  const sprintsFetcher = useCallback(() => listProjectSprints(projectId), [projectId]);
  const tasksFetcher = useCallback(() => listProjectTasks(projectId), [projectId]);
  const project = useResource(projectFetcher);
  const sprints = useResource(sprintsFetcher);
  const tasks = useResource(tasksFetcher);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState<"board" | "list">("board");
  const [editingProject, setEditingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [sprintModal, setSprintModal] = useState<"new" | Sprint | null>(null);
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const actions = useTaskActions((updated) =>
    tasks.mutate((all) => all.map((t) => (t._id === updated._id ? updated : t))),
  );

  if (project.loading && !project.data) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading project">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <ListSkeleton />
      </div>
    );
  }
  if (project.error || !project.data) {
    return (
      <div className="space-y-4">
        <Link href="/projects" className="text-sm text-indigo-600 hover:underline">← Back to projects</Link>
        <ErrorState message={project.error || "Project not found."} onRetry={project.reload} />
      </div>
    );
  }

  const p = project.data;
  const sprintList = sprints.data ?? [];
  const allTasks = tasks.data ?? [];
  const visibleTasks = applyFilters(allTasks, filters);
  const overall = progressOf(allTasks);

  return (
    <div className="space-y-8">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <ArrowLeft size={14} /> Back to projects
      </Link>

      <PageHeader title={p.name} subtitle={p.description || "No description."}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={PROJECT_STATUS_TONE[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
          <Button variant="secondary" onClick={() => setEditingProject(true)}><Pencil size={14} className="mr-1" /> Edit</Button>
          <Button variant="ghost" onClick={() => setDeletingProject(true)}><Trash2 size={14} className="mr-1" /> Delete</Button>
        </div>
      </PageHeader>

      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-900">Overall progress</span>
          <span className="text-slate-500">{overall.done} of {overall.total} tasks done ({overall.percent}%)</span>
        </div>
        <div className="mt-3"><ProgressBar percent={overall.percent} label="Project progress" /></div>
      </Card>

      {/* Sprints */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Sprints</h2>
          <Button variant="secondary" onClick={() => setSprintModal("new")}><Plus size={16} className="mr-1" /> New sprint</Button>
        </div>
        {sprints.loading && !sprints.data && <ListSkeleton rows={2} />}
        {sprints.error && <ErrorState message={sprints.error} onRetry={sprints.reload} />}
        {sprints.data &&
          (sprintList.length ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {sprintList.map((s) => {
                const sp = progressOf(allTasks.filter((t) => t.sprint === s._id));
                return (
                  <li key={s._id}>
                    <Card className="h-full space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{s.name}</h3>
                        <Badge tone={SPRINT_STATUS_TONE[s.status]}>{SPRINT_STATUS_LABEL[s.status]}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(s.startDate)} – {formatDate(s.endDate)}</p>
                      {s.goal && <p className="text-sm text-slate-600">{s.goal}</p>}
                      <div>
                        <ProgressBar percent={sp.percent} label={`${s.name} progress`} />
                        <p className="mt-1 text-xs text-slate-500">{sp.done} of {sp.total} tasks done</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => setFilters({ ...filters, sprint: s._id })}>View tasks</Button>
                        <Button variant="ghost" onClick={() => setSprintModal(s)} aria-label={`Edit ${s.name}`}><Pencil size={14} /></Button>
                        <Button variant="ghost" onClick={() => setDeletingSprint(s)} aria-label={`Delete ${s.name}`}><Trash2 size={14} /></Button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No sprints yet" text="Create a sprint to plan a time-boxed chunk of work." />
          ))}
      </section>

      {/* Tasks */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Tasks</h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setView(view === "board" ? "list" : "board")}>
              {view === "board" ? <List size={16} className="mr-1" /> : <LayoutGrid size={16} className="mr-1" />}
              {view === "board" ? "List" : "Board"} view
            </Button>
            <Button onClick={() => setCreatingTask(true)}><Plus size={16} className="mr-1" /> New task</Button>
          </div>
        </div>
        <TaskFilters value={filters} onChange={setFilters} sprints={sprintList} />
        {tasks.loading && !tasks.data && <ListSkeleton />}
        {tasks.error && <ErrorState message={tasks.error} onRetry={tasks.reload} />}
        {tasks.data &&
          (visibleTasks.length || view === "board" ? (
            view === "board" ? (
              <TaskBoard tasks={visibleTasks} sprints={sprintList} {...actions} />
            ) : (
              <TaskList tasks={visibleTasks} sprints={sprintList} {...actions} />
            )
          ) : (
            <EmptyState title="No tasks found" text={allTasks.length ? "Try changing your filters." : "Create your first task."} />
          ))}
      </section>

      {editingProject && (
        <Modal title="Edit project" onClose={() => setEditingProject(false)}>
          <ProjectForm initial={p} submitLabel="Save changes" onCancel={() => setEditingProject(false)}
            onSubmit={async (values) => {
              const updated = await updateProject(p._id, values);
              project.mutate(() => updated);
              setEditingProject(false);
              toast("Project updated");
            }} />
        </Modal>
      )}

      {deletingProject && (
        <ConfirmDialog
          title="Delete project?"
          message={`"${p.name}" and all of its sprints and tasks will be permanently deleted.`}
          onCancel={() => setDeletingProject(false)}
          onConfirm={async () => {
            try {
              await deleteProject(p._id);
              toast("Project deleted");
              router.replace("/projects");
            } catch (err) {
              toast(errorMessage(err, "Could not delete the project."), "error");
              setDeletingProject(false);
            }
          }}
        />
      )}

      {sprintModal && (
        <Modal title={sprintModal === "new" ? "New sprint" : "Edit sprint"} onClose={() => setSprintModal(null)}>
          <SprintForm
            initial={sprintModal === "new" ? undefined : sprintModal}
            submitLabel={sprintModal === "new" ? "Create sprint" : "Save changes"}
            onCancel={() => setSprintModal(null)}
            onSubmit={async (values) => {
              if (sprintModal === "new") {
                const created = await createSprint(p._id, values);
                sprints.mutate((all) => [created, ...all]);
                toast("Sprint created");
              } else {
                const updated = await updateSprint(sprintModal._id, values);
                sprints.mutate((all) => all.map((s) => (s._id === updated._id ? updated : s)));
                toast("Sprint updated");
              }
              setSprintModal(null);
            }}
          />
        </Modal>
      )}

      {deletingSprint && (
        <ConfirmDialog
          title="Delete sprint?"
          message={`"${deletingSprint.name}" will be deleted. Its tasks move back to the backlog.`}
          onCancel={() => setDeletingSprint(null)}
          onConfirm={async () => {
            try {
              await deleteSprint(deletingSprint._id);
              sprints.mutate((all) => all.filter((s) => s._id !== deletingSprint._id));
              tasks.mutate((all) => all.map((t) => (t.sprint === deletingSprint._id ? { ...t, sprint: null } : t)));
              if (filters.sprint === deletingSprint._id) setFilters({ ...filters, sprint: "all" });
              toast("Sprint deleted");
            } catch (err) {
              toast(errorMessage(err, "Could not delete the sprint."), "error");
            }
            setDeletingSprint(null);
          }}
        />
      )}

      {creatingTask && (
        <Modal title="New task" onClose={() => setCreatingTask(false)}>
          <TaskForm defaultProjectId={p._id} sprints={sprintList} submitLabel="Create task"
            onCancel={() => setCreatingTask(false)}
            onSubmit={async (projectId, values) => {
              const created = await createTask(projectId, values);
              tasks.mutate((all) => [created, ...all]);
              setCreatingTask(false);
              toast("Task created");
            }} />
        </Modal>
      )}
    </div>
  );
}
