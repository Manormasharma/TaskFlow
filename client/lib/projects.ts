import { api } from "./api";
import type { Project, ProjectInput } from "@/types";

export const listProjects = () => api<Project[]>("/projects");
export const getProject = (id: string) => api<Project>(`/projects/${id}`);
export const createProject = (input: ProjectInput) => api<Project>("/projects", "POST", input);
export const updateProject = (id: string, input: Partial<ProjectInput>) =>
  api<Project>(`/projects/${id}`, "PATCH", input);
export const deleteProject = (id: string) => api<null>(`/projects/${id}`, "DELETE");
