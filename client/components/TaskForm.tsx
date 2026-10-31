"use client";

import { useState, type SubmitEvent } from "react";
import type { Project, Sprint, Task, TaskInput, TaskPriority, TaskStatus } from "@/types";
import { fromDateInput, PRIORITY_LABEL, STATUS_LABEL, toDateInput } from "@/lib/format";
import { errorMessage } from "@/lib/api";
import { Alert, Button, Input, Select, Textarea } from "./ui";

interface Props {
  initial?: Task;
  // Provide `projects` to let the user pick a project (creating from a cross-project page).
  projects?: Project[];
  defaultProjectId?: string;
  sprints: Sprint[]; // may include sprints of other projects; filtered by the chosen project
  submitLabel: string;
  onSubmit: (projectId: string, values: TaskInput) => Promise<void>;
  onCancel: () => void;
}

type Errors = Partial<Record<"title" | "description" | "project", string>>;

export default function TaskForm({
  initial,
  projects,
  defaultProjectId,
  sprints,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [projectId, setProjectId] = useState(initial?.project ?? defaultProjectId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(toDateInput(initial?.dueDate));
  const [sprintId, setSprintId] = useState(initial?.sprint ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const projectSprints = sprints.filter((s) => s.project === projectId);
  const sprintOptions = { "": "Backlog (no sprint)", ...Object.fromEntries(projectSprints.map((s) => [s._id, s.name])) };
  const projectOptions = { "": "Select a project", ...Object.fromEntries((projects ?? []).map((p) => [p._id, p.name])) };

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (saving) return;
    setApiError("");

    const found: Errors = {};
    if (!projectId) found.project = "Choose a project.";
    if (title.trim().length < 2) found.title = "Title must be at least 2 characters.";
    else if (title.trim().length > 120) found.title = "Title cannot exceed 120 characters.";
    if (description.length > 2000) found.description = "Description cannot exceed 2000 characters.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit(projectId, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: fromDateInput(dueDate),
        sprintId: sprintId || null,
      });
    } catch (err) {
      setApiError(errorMessage(err, "Could not save the task."));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <Alert>{apiError}</Alert>}
      {projects && (
        <Select id="task-project" label="Project" value={projectId} options={projectOptions} error={errors.project}
          onChange={(e) => { setProjectId(e.target.value); setSprintId(""); }} />
      )}
      <Input id="task-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <Textarea id="task-description" label="Description" value={description}
        onChange={(e) => setDescription(e.target.value)} error={errors.description} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select id="task-status" label="Status" value={status} options={STATUS_LABEL}
          onChange={(e) => setStatus(e.target.value as TaskStatus)} />
        <Select id="task-priority" label="Priority" value={priority} options={PRIORITY_LABEL}
          onChange={(e) => setPriority(e.target.value as TaskPriority)} />
        <Input id="task-due" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Select id="task-sprint" label="Sprint" value={sprintId} options={sprintOptions}
          onChange={(e) => setSprintId(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
