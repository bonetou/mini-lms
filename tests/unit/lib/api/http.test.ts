import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import {
  errorResponse,
  parseJsonBody,
  parseRouteParams,
  parseSearchParams,
  successResponse,
} from "@/lib/api/http";

describe("lib/api/http", () => {
  it("builds success responses with the shared envelope", async () => {
    const response = successResponse({ ok: true }, { status: 201 }, { page: 2 });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: { ok: true },
      error: null,
      meta: { page: 2 },
    });
  });

  it("maps zod errors to BAD_REQUEST responses", async () => {
    const schema = z.object({
      name: z.string(),
    });
    const result = schema.safeParse({});

    if (result.success) {
      throw new Error("Expected validation failure");
    }

    const response = errorResponse(result.error);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      data: null,
      error: {
        code: "BAD_REQUEST",
        message: "Request validation failed",
      },
      meta: null,
    });
  });

  it("maps ApiError instances to their declared status and code", async () => {
    const response = errorResponse(ApiError.conflict("Already cancelled"));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      data: null,
      error: {
        code: "CONFLICT",
        message: "Already cancelled",
        details: null,
      },
      meta: null,
    });
  });

  it("maps unexpected errors to INTERNAL_SERVER_ERROR responses", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = errorResponse(new Error("boom"));

    expect(response.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        details: null,
      },
      meta: null,
    });
  });

  it("parses valid JSON request bodies", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
      headers: {
        "content-type": "application/json",
      },
    });

    const parsed = await parseJsonBody(
      request,
      z.object({
        email: z.string().email(),
      }),
    );

    expect(parsed).toEqual({ email: "user@example.com" });
  });

  it("rejects invalid JSON request bodies with BAD_REQUEST", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: "{invalid",
      headers: {
        "content-type": "application/json",
      },
    });

    await expect(parseJsonBody(request, z.object({}))).rejects.toMatchObject({
      status: 400,
      code: "BAD_REQUEST",
      message: "Invalid JSON body",
    });
  });

  it("parses search params through the provided schema", () => {
    const parsed = parseSearchParams(
      new URLSearchParams({
        page: "2",
      }),
      z.object({
        page: z.coerce.number().int().positive(),
      }),
    );

    expect(parsed).toEqual({ page: 2 });
  });

  it("parses route params through the provided schema", () => {
    const parsed = parseRouteParams(
      {
        id: "11111111-1111-4111-8111-111111111111",
      },
      z.object({
        id: z.uuid(),
      }),
    );

    expect(parsed).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
    });
  });
});
