"use client";

import { useState, type SubmitEvent } from "react";
import { SPRINT_STATUS_LABEL, toDateInput } from "@/lib/format";
import { errorMessage } from "@/lib/api";
import type { Sprint, SprintInput, SprintStatus } from "@/types";
import { Alert, Button, Input, Select, Textarea } from "./ui";

interface Props {
  initial?: Sprint;
  submitLabel: string;
  onSubmit: (values: SprintInput) => Promise<void>;
  onCancel: () => void;
}

type Errors = Partial<Record<"name" | "goal" | "startDate" | "endDate", string>>;

export default function SprintForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [startDate, setStartDate] = useState(toDateInput(initial?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(initial?.endDate));
  const [status, setStatus] = useState<SprintStatus>(initial?.status ?? "planned");
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (saving) return;
    setApiError("");

    const found: Errors = {};
    if (name.trim().length < 2) found.name = "Sprint name must be at least 2 characters.";
    else if (name.trim().length > 100) found.name = "Sprint name cannot exceed 100 characters.";
    if (goal.length > 1000) found.goal = "Goal cannot exceed 1000 characters.";
    if (!startDate) found.startDate = "Start date is required.";
    if (!endDate) found.endDate = "End date is required.";
    else if (startDate && endDate < startDate) found.endDate = "End date must be on or after the start date.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), goal: goal.trim(), startDate, endDate, ...(initial ? { status } : {}) });
    } catch (err) {
      setApiError(errorMessage(err, "Could not save the sprint."));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <Alert>{apiError}</Alert>}
      <Input id="sprint-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Textarea id="sprint-goal" label="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} error={errors.goal} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="sprint-start" label="Start date" type="date" value={startDate}
          onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} />
        <Input id="sprint-end" label="End date" type="date" value={endDate}
          onChange={(e) => setEndDate(e.target.value)} error={errors.endDate} />
      </div>
      {initial && (
        <Select id="sprint-status" label="Status" value={status} options={SPRINT_STATUS_LABEL}
          onChange={(e) => setStatus(e.target.value as SprintStatus)} />
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
