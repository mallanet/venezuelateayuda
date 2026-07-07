import { NextResponse } from "next/server";

export const ApiErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION: "VALIDATION",
  UNSUPPORTED: "UNSUPPORTED",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export function apiErrorResponse(
  code: ApiErrorCode,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}

export function readApiErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return fallback;
  }
  const message = body.error;
  return typeof message === "string" ? message : fallback;
}
