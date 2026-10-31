export interface ApiResponse<T> {
  message: string;
  error: boolean;
  error_code: string;
  data: T | null;
  formatting_args: Record<string, unknown> | null;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
}

export type ProjectStatus = "active" | "completed" | "archived";
export type SprintStatus = "planned" | "active" | "completed";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

// The backend returns raw Mongoose documents, so ids are `_id` and
// relations (owner, project, sprint) are plain id strings.
interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Project extends Timestamps {
  _id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: string;
}

export interface ProjectInput {
  name: string;
  description: string;
  status?: ProjectStatus;
}

export interface Sprint extends Timestamps {
  _id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  project: string;
  owner: string;
}

export interface SprintInput {
  name: string;
  goal: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status?: SprintStatus;
}

export interface Task extends Timestamps {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  project: string;
  sprint: string | null;
  owner: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // ISO datetime, as the backend validator requires
  sprintId: string | null; // null = backlog
}
