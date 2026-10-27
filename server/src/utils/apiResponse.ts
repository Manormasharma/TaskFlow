import type { Response } from "express";

interface ApiResponseOptions<T> {
  message: string;
  data: T | null;
  error?: boolean;
  error_code?: string;
  formatting_args?: Record<string, unknown> | null;
}

export function sendApiResponse<T>(
  res: Response,
  statusCode: number,
  options: ApiResponseOptions<T>
) {
  return res.status(statusCode).json({
    message: options.message,
    error: options.error ?? false,
    error_code: options.error_code ?? "000",
    data: options.data,
    formatting_args: options.formatting_args ?? null,
  });
}
