"use client";

import { listProjects } from "@/lib/projects";
import { listProjectSprints } from "@/lib/sprints";
import { listProjectTasks } from "@/lib/tasks";
import type { Project, Sprint, Task } from "@/types";
import { useResource } from "./useResource";

export interface Workspace {
  projects: Project[];
  sprints: Sprint[];
  tasks: Task[];
}

// The backend has no cross-project endpoints, so fetch each project's sprints and tasks.
async function loadWorkspace(): Promise<Workspace> {
  const projects = await listProjects();
  const perProject = await Promise.all(
    projects.map(async (p) => {
      const [sprints, tasks] = await Promise.all([listProjectSprints(p._id), listProjectTasks(p._id)]);
      return { sprints, tasks };
    }),
  );
  return {
    projects,
    sprints: perProject.flatMap((p) => p.sprints),
    tasks: perProject.flatMap((p) => p.tasks),
  };
}

export function useWorkspace() {
  return useResource<Workspace>(loadWorkspace);
}
