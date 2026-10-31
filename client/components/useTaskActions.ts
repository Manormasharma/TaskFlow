"use client";

import { errorMessage } from "@/lib/api";
import { updateTask } from "@/lib/tasks";
import type { Task, TaskInput } from "@/types";
import type { TaskActions } from "./TaskList";
import { useToast } from "./ToastProvider";

// Inline task changes (status / sprint) used by the board and list views.
export function useTaskActions(onUpdated: (task: Task) => void): TaskActions {
  const toast = useToast();

  async function update(task: Task, changes: Partial<TaskInput>, success: string) {
    try {
      onUpdated(await updateTask(task._id, changes));
      toast(success);
    } catch (err) {
      toast(errorMessage(err, "Could not update the task."), "error");
    }
  }

  return {
    onStatusChange: (task, status) => update(task, { status }, "Task moved"),
    onSprintChange: (task, sprintId) =>
      update(task, { sprintId }, sprintId ? "Task moved to sprint" : "Task moved to backlog"),
  };
}
