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

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

// Expected contract: the backend has no task endpoints yet (see README notes).
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Pick<
  Task,
  "title" | "description" | "status" | "priority" | "dueDate"
>;
