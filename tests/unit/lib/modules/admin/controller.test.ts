import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { AdminController } from "@/lib/modules/admin/controller";

const adminServiceMock = {
  listConsultations: vi.fn(),
  getConsultationById: vi.fn(),
  listUsers: vi.fn(),
  getUserById: vi.fn(),
};

const adminContextMock = {
  routeClient: {
    applyCookies: (response: Response) => response,
  },
  user: {
    id: "admin-1",
  },
  profile: null,
  roles: ["admin"],
  isAdmin: true,
} as const;

describe("admin controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists admin consultations using parsed query params", async () => {
    adminServiceMock.listConsultations.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      pageSize: 5,
    });

    const controller = new AdminController(adminServiceMock);
    const response = await controller.listConsultations(
      new NextRequest(
        "http://localhost/api/admin/consultations?page=2&pageSize=5",
      ),
    );

    expect(adminServiceMock.listConsultations).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 5,
      }),
    );
    expect(response.status).toBe(200);
  });

  it("loads one admin consultation by id", async () => {
    adminServiceMock.getConsultationById.mockResolvedValue({
      id: "consultation-1",
    });

    const controller = new AdminController(adminServiceMock);
    const response = await controller.getConsultationById(
      new NextRequest("http://localhost/api/admin/consultations/1"),
      adminContextMock,
      { id: "11111111-1111-4111-8111-111111111111" },
    );

    expect(adminServiceMock.getConsultationById).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(response.status).toBe(200);
  });

  it("lists admin users using parsed query params", async () => {
    adminServiceMock.listUsers.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const controller = new AdminController(adminServiceMock);
    const response = await controller.listUsers(
      new NextRequest("http://localhost/api/admin/users?page=1&pageSize=10"),
    );

    expect(adminServiceMock.listUsers).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
    expect(response.status).toBe(200);
  });

  it("loads one admin user by id", async () => {
    adminServiceMock.getUserById.mockResolvedValue({
      id: "user-1",
    });

    const controller = new AdminController(adminServiceMock);
    const response = await controller.getUserById(
      new NextRequest("http://localhost/api/admin/users/1"),
      adminContextMock,
      { id: "11111111-1111-4111-8111-111111111111" },
    );

    expect(adminServiceMock.getUserById).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(response.status).toBe(200);
  });

  it("surfaces service errors for the route layer to wrap", async () => {
    adminServiceMock.getUserById.mockRejectedValue(
      ApiError.notFound("User not found"),
    );

    const controller = new AdminController(adminServiceMock);

    await expect(
      controller.getUserById(
        new NextRequest("http://localhost/api/admin/users/1"),
        adminContextMock,
        { id: "11111111-1111-4111-8111-111111111111" },
      ),
    ).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "User not found",
    });
  });
});
