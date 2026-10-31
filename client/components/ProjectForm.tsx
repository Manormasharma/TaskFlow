"use client";

import { useState, type SubmitEvent } from "react";
import { PROJECT_STATUS_LABEL } from "@/lib/format";
import { errorMessage } from "@/lib/api";
import type { Project, ProjectInput, ProjectStatus } from "@/types";
import { Alert, Button, Input, Select, Textarea } from "./ui";

interface Props {
  initial?: Project;
  submitLabel: string;
  onSubmit: (values: ProjectInput) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "active");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (saving) return;
    setApiError("");

    const found: typeof errors = {};
    if (name.trim().length < 2) found.name = "Project name must be at least 2 characters.";
    else if (name.trim().length > 100) found.name = "Project name cannot exceed 100 characters.";
    if (description.length > 1000) found.description = "Description cannot exceed 1000 characters.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        ...(initial ? { status } : {}),
      });
    } catch (err) {
      setApiError(errorMessage(err, "Could not save the project."));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <Alert>{apiError}</Alert>}
      <Input id="project-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Textarea id="project-description" label="Description" value={description}
        onChange={(e) => setDescription(e.target.value)} error={errors.description} />
      {initial && (
        <Select id="project-status" label="Status" value={status} options={PROJECT_STATUS_LABEL}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)} />
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
