"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Loading } from "@/components/ui";
import TaskForm from "@/components/TaskForm";
import { TaskBadges } from "@/components/TaskList";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { deleteTask, getTask, updateTask } from "@/lib/tasks";
import type { Task, TaskInput } from "@/types";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getTask(id)
      .then((t) => (t ? setTask(t) : setError("Task not found.")))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) setError("Task not found (or the task API is not available yet).");
        else setError(err instanceof Error ? err.message : "Could not load the task.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(values: TaskInput) {
    setTask(await updateTask(id, values));
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await deleteTask(id);
      router.replace("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the task.");
    }
  }

  if (loading) return <Loading text="Loading task..." />;

  return (
    <div className="space-y-4">
      <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">← Back to tasks</Link>
      {error && <Alert>{error}</Alert>}
      {task && (
        <Card className="space-y-4">
          {editing ? (
            <TaskForm initial={task} submitLabel="Save changes" onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
              <TaskBadges task={task} />
              <p className="whitespace-pre-wrap text-slate-700">{task.description || "No description."}</p>
              <dl className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <div><dt className="font-medium">Due</dt><dd>{formatDate(task.dueDate)}</dd></div>
                <div><dt className="font-medium">Created</dt><dd>{formatDate(task.createdAt)}</dd></div>
                <div><dt className="font-medium">Updated</dt><dd>{formatDate(task.updatedAt)}</dd></div>
              </dl>
              <div className="flex gap-2">
                <Button onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
