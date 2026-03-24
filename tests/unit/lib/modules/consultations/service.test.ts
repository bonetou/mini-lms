import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsultationsService } from "@/lib/modules/consultations/service";

const FIXED_NOW_ISO = "2026-03-23T15:00:00.000Z";

const { repositoryMock, adminRepositoryMock } = vi.hoisted(() => ({
  repositoryMock: {
    listOwn: vi.fn(),
    create: vi.fn(),
    findOwnById: vi.fn(),
    getOwnHistory: vi.fn(),
    getLatestNonCompletedStatus: vi.fn(),
    updateOwn: vi.fn(),
  },
  adminRepositoryMock: {
    listAll: vi.fn(),
    findById: vi.fn(),
    getHistory: vi.fn(),
    getStudentProfile: vi.fn(),
  },
}));

vi.mock("@/lib/dates", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dates")>(
    "@/lib/dates",
  );

  return {
    ...actual,
    nowIso: vi.fn(() => FIXED_NOW_ISO),
  };
});

vi.mock("@/lib/modules/consultations/repository", async () => {
  return {
    ConsultationsRepository: vi.fn(() => repositoryMock),
    ConsultationsAdminRepository: vi.fn(() => adminRepositoryMock),
    mapConsultation: (row: Record<string, unknown>) => ({
      id: row.id,
      studentId: row.student_id,
      studentFirstName: row.student_first_name,
      studentLastName: row.student_last_name,
      reason: row.reason,
      scheduledAt: row.scheduled_at,
      status: row.status,
      isCompleted: row.is_completed,
      cancelledAt: row.cancelled_at,
      cancellationReason: row.cancellation_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }),
    mapConsultationHistory: (row: Record<string, unknown>) => ({
      id: row.id,
      consultationId: row.consultation_id,
      changedByUserId: row.changed_by_user_id,
      fromStatus: row.from_status,
      toStatus: row.to_status,
      notes: row.notes,
      createdAt: row.created_at,
    }),
  };
});

function buildContext(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  } as never;
}

function consultationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "consultation-1",
    student_id: "student-1",
    student_first_name: "Jane",
    student_last_name: "Doe",
    reason: "Need help with calculus",
    scheduled_at: "2026-04-01T12:00:00.000Z",
    status: "SCHEDULED",
    is_completed: false,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: "2026-03-20T10:00:00.000Z",
    updated_at: "2026-03-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("ConsultationsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists own consultations for students", async () => {
    repositoryMock.listOwn.mockResolvedValue({
      rows: [consultationRow()],
      count: 1,
    });

    const service = new ConsultationsService(buildContext());
    const result = await service.list(buildContext(), {
      scope: "own",
      status: undefined,
      studentId: undefined,
      scheduledFrom: undefined,
      scheduledTo: undefined,
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: "consultation-1",
          studentId: "student-1",
          status: "SCHEDULED",
        }),
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      scope: "own",
    });
  });


  it("rejects create when scheduledAt is in the past", async () => {
    const service = new ConsultationsService(buildContext());

    await expect(
      service.create(buildContext(), {
        reason: "Need help",
        scheduledAt: "2000-01-01T00:00:00.000Z",
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "BAD_REQUEST",
      message: "Consultations must be scheduled in the future.",
    });
  });

  it("rejects student mutations when the profile is missing", async () => {
    const service = new ConsultationsService(buildContext({ profile: null }));

    await expect(
      service.create(buildContext({ profile: null }), {
        reason: "Need help",
        scheduledAt: "2099-01-01T00:00:00.000Z",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Profile is not ready for this account",
    });
  });


  it("rejects editing cancelled consultations", async () => {
    repositoryMock.findOwnById.mockResolvedValue(
      consultationRow({ status: "CANCELLED" }),
    );

    const context = buildContext();
    const service = new ConsultationsService(context);

    await expect(
      service.patch(context, "consultation-1", {
        reason: "Updated reason",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Cancelled consultations cannot be edited.",
    });
  });

  it("reschedules consultations by forcing RESCHEDULED state and clearing cancellation fields", async () => {
    repositoryMock.findOwnById.mockResolvedValue(consultationRow());
    repositoryMock.updateOwn.mockResolvedValue(
      consultationRow({
        status: "RESCHEDULED",
        scheduled_at: "2099-04-01T09:00:00.000Z",
      }),
    );

    const context = buildContext();
    const service = new ConsultationsService(context);

    await service.reschedule(context, "consultation-1", {
      scheduledAt: "2099-04-01T09:00:00.000Z",
    });

    expect(repositoryMock.updateOwn).toHaveBeenCalledWith(
      "consultation-1",
      "student-1",
      {
        scheduled_at: "2099-04-01T09:00:00.000Z",
        status: "RESCHEDULED",
        is_completed: false,
        cancelled_at: null,
        cancellation_reason: null,
      },
    );
  });

  it("rejects cancelling completed consultations", async () => {
    repositoryMock.findOwnById.mockResolvedValue(
      consultationRow({ status: "COMPLETED", is_completed: true }),
    );

    const context = buildContext();
    const service = new ConsultationsService(context);

    await expect(
      service.cancel(context, "consultation-1", {
        cancellationReason: "No longer needed",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Completed consultations cannot be cancelled.",
    });
  });

  it("rejects completing cancelled consultations", async () => {
    repositoryMock.findOwnById.mockResolvedValue(
      consultationRow({ status: "CANCELLED" }),
    );

    const context = buildContext();
    const service = new ConsultationsService(context);

    await expect(
      service.toggleComplete(context, "consultation-1", {
        isCompleted: true,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Cancelled consultations cannot be completed",
    });
  });

  it("restores the latest non-completed status when uncompleting", async () => {
    repositoryMock.findOwnById.mockResolvedValue(
      consultationRow({ status: "COMPLETED", is_completed: true }),
    );
    repositoryMock.getLatestNonCompletedStatus.mockResolvedValue("RESCHEDULED");
    repositoryMock.updateOwn.mockResolvedValue(
      consultationRow({
        status: "RESCHEDULED",
        is_completed: false,
      }),
    );

    const context = buildContext();
    const service = new ConsultationsService(context);

    await service.toggleComplete(context, "consultation-1", {
      isCompleted: false,
    });

    expect(repositoryMock.updateOwn).toHaveBeenCalledWith(
      "consultation-1",
      "student-1",
      {
        status: "RESCHEDULED",
        is_completed: false,
      },
    );
  });
});
