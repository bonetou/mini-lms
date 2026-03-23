import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminService } from "@/lib/modules/admin/service";

const { adminRepositoryMock } = vi.hoisted(() => ({
  adminRepositoryMock: {
    listConsultations: vi.fn(),
    getConsultationById: vi.fn(),
    listUsers: vi.fn(),
    getUserById: vi.fn(),
  },
}));

vi.mock("@/lib/modules/admin/repository", () => ({
  AdminRepository: vi.fn(() => adminRepositoryMock),
}));

describe("AdminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists consultations by delegating to the repository", async () => {
    adminRepositoryMock.listConsultations.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const service = new AdminService();

    await expect(
      service.listConsultations({
        status: undefined,
        studentId: undefined,
        search: undefined,
        scheduledFrom: undefined,
        scheduledTo: undefined,
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
  });

  it("throws NOT_FOUND for unknown consultations", async () => {
    adminRepositoryMock.getConsultationById.mockResolvedValue(null);

    const service = new AdminService();

    await expect(service.getConsultationById("missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Consultation not found",
    });
  });

  it("lists users by delegating to the repository", async () => {
    adminRepositoryMock.listUsers.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const service = new AdminService();

    await expect(service.listUsers({ page: 1, pageSize: 10 })).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
  });

  it("throws NOT_FOUND for unknown users", async () => {
    adminRepositoryMock.getUserById.mockResolvedValue(null);

    const service = new AdminService();

    await expect(service.getUserById("missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "User not found",
    });
  });
});
