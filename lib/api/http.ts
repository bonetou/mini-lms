import { ZodError, z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { ApiError, isApiError } from "./errors";

type ApiMeta = Record<string, unknown> | null;

export function successResponse<T>(
  data: T,
  init?: ResponseInit,
  meta: ApiMeta = null,
) {
  return NextResponse.json(
    {
      data,
      error: null,
      meta,
    },
    init,
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "Request validation failed",
          details: error.flatten(),
        },
        meta: null,
      },
      { status: 400 },
    );
  }

  if (isApiError(error)) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
        meta: null,
      },
      { status: error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        details: null,
      },
      meta: null,
    },
    { status: 500 },
  );
}

export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T,
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw ApiError.badRequest("Invalid JSON body");
    }

    throw error;
  }
}

export function parseSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T,
): z.infer<T> {
  const values = Object.fromEntries(searchParams.entries());
  return schema.parse(values);
}

export function parseRouteParams<T extends z.ZodTypeAny>(
  params: unknown,
  schema: T,
): z.infer<T> {
  return schema.parse(params);
}
