import { api } from "./api";
import type { Sprint, SprintInput } from "@/types";

export const listProjectSprints = (projectId: string) =>
  api<Sprint[]>(`/projects/${projectId}/sprints`);
export const getSprint = (id: string) => api<Sprint>(`/sprints/${id}`);
export const createSprint = (projectId: string, input: SprintInput) =>
  api<Sprint>(`/projects/${projectId}/sprints`, "POST", input);
export const updateSprint = (id: string, input: Partial<SprintInput>) =>
  api<Sprint>(`/sprints/${id}`, "PATCH", input);
export const deleteSprint = (id: string) => api<null>(`/sprints/${id}`, "DELETE");
