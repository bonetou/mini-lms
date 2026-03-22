export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiEnvelope<T> = {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: Record<string, unknown> | null;
};

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  if (!contentType.includes("application/json")) {
    throw new ApiClientError(
      "The server returned a non-JSON response",
      response.status,
      "INVALID_RESPONSE",
      rawBody.slice(0, 300),
    );
  }

  let payload: ApiEnvelope<T>;

  try {
    payload = JSON.parse(rawBody) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError(
      "The server returned invalid JSON",
      response.status,
      "INVALID_RESPONSE",
      rawBody.slice(0, 300),
    );
  }

  if (!response.ok || payload.error) {
    throw new ApiClientError(
      payload.error?.message ?? "Request failed",
      response.status,
      payload.error?.code,
      payload.error?.details,
    );
  }

  return payload.data as T;
}
