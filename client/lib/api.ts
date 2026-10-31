import type { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

// AuthProvider registers this so an expired session signs the user out everywhere.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

// Validation errors arrive as zod's flatten() output inside `data`.
function readFieldErrors(data: unknown): Record<string, string[]> {
  if (typeof data !== "object" || data === null || !("fieldErrors" in data)) return {};
  const raw = (data as { fieldErrors: unknown }).fieldErrors;
  if (typeof raw !== "object" || raw === null) return {};
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) result[key] = value.filter((v): v is string => typeof v === "string");
  }
  return result;
}

export async function api<T>(path: string, method: Method = "GET", body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection.", 0, "NETWORK_ERROR");
  }

  // Empty or non-JSON responses are treated as "no envelope".
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || json?.error) {
    if (res.status === 401 && !path.startsWith("/auth/")) unauthorizedHandler?.();

    const fieldErrors = readFieldErrors(json?.data);
    const firstFieldError = Object.values(fieldErrors).flat()[0];
    throw new ApiError(
      firstFieldError ?? json?.message ?? `Request failed (${res.status})`,
      res.status,
      json?.error_code ?? "UNKNOWN",
      fieldErrors,
    );
  }

  return json?.data as T;
}

export const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;
