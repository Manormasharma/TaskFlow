"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, Card, ConfirmDialog, ErrorState, ListSkeleton, Modal } from "@/components/ui";
import TaskForm from "@/components/TaskForm";
import { TaskBadges } from "@/components/TaskList";
import { useToast } from "@/components/ToastProvider";
import { useResource } from "@/components/useResource";
import { errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getProject } from "@/lib/projects";
import { listProjectSprints } from "@/lib/sprints";
import { deleteTask, getTask, updateTask } from "@/lib/tasks";
import type { Project, Sprint, Task } from "@/types";

interface Detail {
  task: Task;
  project: Project;
  sprints: Sprint[];
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetcher = useCallback(async (): Promise<Detail> => {
    const task = await getTask(id);
    const [project, sprints] = await Promise.all([getProject(task.project), listProjectSprints(task.project)]);
    return { task, project, sprints };
  }, [id]);
  const { data, loading, error, reload, mutate } = useResource(fetcher);

  if (loading && !data) return <ListSkeleton rows={3} />;
  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">← Back to tasks</Link>
        <ErrorState message={error || "Task not found."} onRetry={reload} />
      </div>
    );
  }

  const { task, project, sprints } = data;
  const sprintName = sprints.find((s) => s._id === task.sprint)?.name ?? "Backlog";

  return (
    <div className="space-y-4">
      <Link href={`/projects/${project._id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <ArrowLeft size={14} /> Back to {project.name}
      </Link>

      <Card className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
        <TaskBadges task={task} />
        <p className="whitespace-pre-wrap text-slate-700">{task.description || "No description."}</p>
        <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="font-medium text-slate-900">Project</dt><dd>{project.name}</dd></div>
          <div><dt className="font-medium text-slate-900">Sprint</dt><dd>{sprintName}</dd></div>
          <div><dt className="font-medium text-slate-900">Due</dt><dd>{formatDate(task.dueDate)}</dd></div>
          <div><dt className="font-medium text-slate-900">Updated</dt><dd>{formatDate(task.updatedAt)}</dd></div>
        </dl>
        <div className="flex gap-2">
          <Button onClick={() => setEditing(true)}><Pencil size={14} className="mr-1" /> Edit</Button>
          <Button variant="danger" onClick={() => setDeleting(true)}><Trash2 size={14} className="mr-1" /> Delete</Button>
        </div>
      </Card>

      {editing && (
        <Modal title="Edit task" onClose={() => setEditing(false)}>
          <TaskForm initial={task} sprints={sprints} submitLabel="Save changes" onCancel={() => setEditing(false)}
            onSubmit={async (_projectId, values) => {
              const updated = await updateTask(task._id, values);
              mutate((d) => ({ ...d, task: updated }));
              setEditing(false);
              toast("Task updated");
            }} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${task.title}" will be permanently deleted.`}
          onCancel={() => setDeleting(false)}
          onConfirm={async () => {
            try {
              await deleteTask(task._id);
              toast("Task deleted");
              router.replace(`/projects/${project._id}`);
            } catch (err) {
              toast(errorMessage(err, "Could not delete the task."), "error");
              setDeleting(false);
            }
          }}
        />
      )}
    </div>
  );
}
