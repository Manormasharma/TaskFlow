import { api } from "./api";
import type { Task, TaskInput } from "@/types";

export const listProjectTasks = (projectId: string) => api<Task[]>(`/projects/${projectId}/tasks`);
export const createTask = (projectId: string, input: TaskInput) =>
  api<Task>(`/projects/${projectId}/tasks`, "POST", input);

// NOTE: the backend defines /tasks/:taskId routes but app.ts does not mount them yet
// (needs `app.use("/api/tasks", taskRoutes)`), so these 404 until that is added.
export const getTask = (id: string) => api<Task>(`/tasks/${id}`);
export const updateTask = (id: string, input: Partial<TaskInput>) =>
  api<Task>(`/tasks/${id}`, "PATCH", input);
export const deleteTask = (id: string) => api<null>(`/tasks/${id}`, "DELETE");
