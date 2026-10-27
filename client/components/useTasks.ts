"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { listTasks } from "@/lib/tasks";
import type { Task } from "@/types";

// `unavailable` = the backend has no task endpoints yet (404).
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const fetchTasks = useCallback(() => {
    listTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) setUnavailable(true);
        else setError(err instanceof Error ? err.message : "Could not load tasks.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Initial load: state already starts as loading, so no setState is needed here.
  useEffect(fetchTasks, [fetchTasks]);

  const reload = () => {
    setLoading(true);
    setError("");
    fetchTasks();
  };

  return { tasks, loading, error, unavailable, reload };
}
