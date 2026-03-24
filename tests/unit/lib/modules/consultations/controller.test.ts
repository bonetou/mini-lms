import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { ConsultationsController } from "@/lib/modules/consultations/controller";

const consultationsServiceMock = {
  list: vi.fn(),
  create: vi.fn(),
  getById: vi.fn(),
  patch: vi.fn(),
  reschedule: vi.fn(),
  cancel: vi.fn(),
  toggleComplete: vi.fn(),
};

const authContextMock = {
  routeClient: {
    supabase: {},
    applyCookies: (response: Response) => response,
  },
  user: {
    id: "student-1",
  },
  profile: {
    id: "student-1",
    email: "student@example.com",
    firstName: "Jane",
    lastName: "Doe",
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  },
  roles: ["student"],
  isAdmin: false,
} as const;

describe("consultation controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists consultations using parsed query params", async () => {
    consultationsServiceMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      pageSize: 20,
      scope: "own",
    });

    const controller = new ConsultationsController(consultationsServiceMock);
    const request = new NextRequest(
      "http://localhost/api/consultations?page=2&pageSize=20",
    );

    const response = await controller.list(request, authContextMock);

    expect(consultationsServiceMock.list).toHaveBeenCalledWith(
      authContextMock,
      expect.objectContaining({
        page: 2,
        pageSize: 20,
        scope: "own",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("creates consultations with a 201 response", async () => {
    consultationsServiceMock.create.mockResolvedValue({
      id: "consultation-1",
    });

    const controller = new ConsultationsController(consultationsServiceMock);
    const request = new NextRequest("http://localhost/api/consultations", {
      method: "POST",
      body: JSON.stringify({
        reason: "Need help",
        scheduledAt: "2099-01-01T00:00:00.000Z",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await controller.create(request, authContextMock);

    expect(consultationsServiceMock.create).toHaveBeenCalledWith(authContextMock, {
      reason: "Need help",
      scheduledAt: "2099-01-01T00:00:00.000Z",
    });
    expect(response.status).toBe(201);
  });

  it("returns BAD_REQUEST when create payload validation fails", async () => {
    const controller = new ConsultationsController(consultationsServiceMock);
    const request = new NextRequest("http://localhost/api/consultations", {
      method: "POST",
      body: JSON.stringify({
        reason: "",
        scheduledAt: "invalid",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    await expect(controller.create(request, authContextMock)).rejects.toHaveProperty(
      "name",
      "ZodError",
    );
    expect(consultationsServiceMock.create).not.toHaveBeenCalled();
  });

  it("loads one consultation by route param", async () => {
    consultationsServiceMock.getById.mockResolvedValue({
      id: "consultation-1",
    });

    const controller = new ConsultationsController(consultationsServiceMock);
    const response = await controller.getById(
      new NextRequest("http://localhost/api/consultations/consultation-1"),
      authContextMock,
      { id: "11111111-1111-4111-8111-111111111111" },
    );

    expect(consultationsServiceMock.getById).toHaveBeenCalledWith(
      authContextMock,
      "11111111-1111-4111-8111-111111111111",
    );
    expect(response.status).toBe(200);
  });

  it("passes patch requests through to the service", async () => {
    consultationsServiceMock.patch.mockResolvedValue({
      id: "consultation-1",
    });

    const controller = new ConsultationsController(consultationsServiceMock);
    const response = await controller.patch(
      new NextRequest("http://localhost/api/consultations/consultation-1", {
        method: "PATCH",
        body: JSON.stringify({
          reason: "Updated reason",
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
      authContextMock,
      { id: "11111111-1111-4111-8111-111111111111" },
    );

    expect(consultationsServiceMock.patch).toHaveBeenCalledWith(
      authContextMock,
      "11111111-1111-4111-8111-111111111111",
      {
        reason: "Updated reason",
      },
    );
    expect(response.status).toBe(200);
  });

  it("surfaces service conflicts from reschedule", async () => {
    consultationsServiceMock.reschedule.mockRejectedValue(
      ApiError.conflict("Cancelled consultations cannot be rescheduled."),
    );

    const controller = new ConsultationsController(consultationsServiceMock);

    await expect(
      controller.reschedule(
        new NextRequest("http://localhost/api/consultations/consultation-1", {
          method: "POST",
          body: JSON.stringify({
            scheduledAt: "2099-01-01T00:00:00.000Z",
          }),
          headers: {
            "content-type": "application/json",
          },
        }),
        authContextMock,
        { id: "11111111-1111-4111-8111-111111111111" },
      ),
    ).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Cancelled consultations cannot be rescheduled.",
    });
  });

  it("passes cancellation payloads through to the service", async () => {
    consultationsServiceMock.cancel.mockResolvedValue({
      id: "consultation-1",
    });

    const controller = new ConsultationsController(consultationsServiceMock);
    const response = await controller.cancel(
      new NextRequest("http://localhost/api/consultations/consultation-1", {
        method: "POST",
        body: JSON.stringify({
          cancellationReason: "No longer needed",
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
      authContextMock,
      { id: "11111111-1111-4111-8111-111111111111" },
    );

    expect(consultationsServiceMock.cancel).toHaveBeenCalledWith(
      authContextMock,
      "11111111-1111-4111-8111-111111111111",
      {
        cancellationReason: "No longer needed",
      },
    );
    expect(response.status).toBe(200);
  });

  it("passes completion toggles through to the service", async () => {
    consultationsServiceMock.toggleComplete.mockResolvedValue({
      id: "consultation-1",
      isCompleted: true,
    });

    const controller = new ConsultationsController(consultationsServiceMock);
    const response = await controller.toggleComplete(
      new NextRequest("http://localhost/api/consultations/consultation-1", {
        method: "POST",
        body: JSON.stringify({
          isCompleted: true,
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
      authContextMock,
      { id: "11111111-1111-4111-8111-111111111111" },
    );

    expect(consultationsServiceMock.toggleComplete).toHaveBeenCalledWith(
      authContextMock,
      "11111111-1111-4111-8111-111111111111",
      {
        isCompleted: true,
      },
    );
    expect(response.status).toBe(200);
  });
});
