"use client";

import { useState, type SubmitEvent } from "react";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/types";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/format";
import { Alert, Button, Field, Input, Select } from "./ui";

interface Props {
  initial?: Task;
  submitLabel: string;
  onSubmit: (values: TaskInput) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required.");
    setError("");
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), description, status, priority, dueDate: dueDate || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the task.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Field id="description" label="Description">
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select id="status" label="Status" value={status} options={STATUS_LABEL}
          onChange={(e) => setStatus(e.target.value as TaskStatus)} />
        <Select id="priority" label="Priority" value={priority} options={PRIORITY_LABEL}
          onChange={(e) => setPriority(e.target.value as TaskPriority)} />
        <Input id="dueDate" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
