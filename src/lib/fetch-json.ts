import { readApiErrorMessage } from "@/lib/api-error";

export class FetchJsonError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "FetchJsonError";
  }
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new FetchJsonError(
      readApiErrorMessage(body, "No se pudo cargar la información"),
      response.status
    );
  }
  return body as T;
}
