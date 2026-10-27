import { api } from "./api";
import type { Task, TaskInput } from "@/types";

// These endpoints are NOT implemented in the backend yet.
// Expected contract: each returns the standard envelope, `data` is a Task (or Task[]).
export const listTasks = () => api<Task[]>("/tasks");
export const getTask = (id: string) => api<Task>(`/tasks/${id}`);
export const createTask = (input: TaskInput) => api<Task>("/tasks", "POST", input);
export const updateTask = (id: string, input: Partial<TaskInput>) =>
  api<Task>(`/tasks/${id}`, "PATCH", input);
export const deleteTask = (id: string) => api<null>(`/tasks/${id}`, "DELETE");
