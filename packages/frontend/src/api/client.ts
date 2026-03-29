const API_BASE = "/api";

export type FetchOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
};

export type ApiError = Error & { status: number };

export const apiFetch = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
  const { body, headers = {}, method = "GET" } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    method,
  });

  if (!response.ok) {
    let errorPayload: { error?: string; message?: string } | null = null;

    try {
      errorPayload = (await response.json()) as { error?: string; message?: string };
    } catch {
      errorPayload = null;
    }

    const error = new Error(errorPayload?.message || errorPayload?.error || `API error: ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return response.json() as Promise<T>;
};
