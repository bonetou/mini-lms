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

export type ValidationErrorDetails = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

export function isValidationErrorDetails(
  details: unknown,
): details is ValidationErrorDetails {
  if (!details || typeof details !== "object") {
    return false;
  }

  return "formErrors" in details || "fieldErrors" in details;
}

export function getValidationErrors(error: unknown): {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
} {
  if (!(error instanceof ApiClientError) || !isValidationErrorDetails(error.details)) {
    return {
      formErrors: [],
      fieldErrors: {},
    };
  }

  return {
    formErrors: error.details.formErrors ?? [],
    fieldErrors: Object.fromEntries(
      Object.entries(error.details.fieldErrors ?? {}).filter(
        (entry): entry is [string, string[]] =>
          Array.isArray(entry[1]) && entry[1].length > 0,
      ),
    ),
  };
}

export function getApiErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiClientError)) {
    return error instanceof Error ? error.message : "An error occurred";
  }

  if (error.status >= 500) {
    return "Internal Server Error";
  }

  const validationErrors = getValidationErrors(error);

  if (validationErrors.formErrors.length > 0) {
    return validationErrors.formErrors[0];
  }

  if (
    error.code === "BAD_REQUEST" &&
    Object.keys(validationErrors.fieldErrors).length > 0
  ) {
    return null;
  }

  return error.message;
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
