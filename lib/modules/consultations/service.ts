import { ApiError } from "@/lib/api/errors";
import { AuthContext } from "@/lib/api/auth-context";
import {
  AdminConsultationListQuery,
  ConsultationListQuery,
  ConsultationStatus,
} from "./schemas";
import {
  ConsultationsAdminRepository,
  ConsultationsRepository,
  mapConsultation,
  mapConsultationHistory,
} from "./repository";

export class ConsultationsService {
  private readonly repository: ConsultationsRepository;
  private readonly adminRepository = new ConsultationsAdminRepository();

  constructor(context: AuthContext) {
    this.repository = new ConsultationsRepository(context.routeClient.supabase);
  }

  private assertStudentMutationAllowed(context: AuthContext) {
    if (context.isAdmin) {
      throw ApiError.forbidden(
        "Admin mutations are not allowed through consultation endpoints",
      );
    }

    if (!context.profile) {
      throw ApiError.conflict("Profile is not ready for this account");
    }
  }

  async list(context: AuthContext, filters: ConsultationListQuery) {
    if (filters.scope === "all") {
      if (!context.isAdmin) {
        throw ApiError.forbidden();
      }

      const adminFilters: AdminConsultationListQuery = {
        status: filters.status,
        studentId: filters.studentId,
        scheduledFrom: filters.scheduledFrom,
        scheduledTo: filters.scheduledTo,
        page: filters.page,
        pageSize: filters.pageSize,
      };
      const result = await this.adminRepository.listAll(adminFilters);

      return {
        items: result.rows.map(mapConsultation),
        total: result.count,
        page: filters.page,
        pageSize: filters.pageSize,
        scope: "all" as const,
      };
    }

    const result = await this.repository.listOwn(context.user.id, filters);

    return {
      items: result.rows.map(mapConsultation),
      total: result.count,
      page: filters.page,
      pageSize: filters.pageSize,
      scope: "own" as const,
    };
  }

  async create(
    context: AuthContext,
    input: { reason: string; scheduledAt: string },
  ) {
    this.assertStudentMutationAllowed(context);

    const created = await this.repository.create({
      studentId: context.user.id,
      studentFirstName: context.profile?.firstName ?? "",
      studentLastName: context.profile?.lastName ?? "",
      reason: input.reason,
      scheduledAt: input.scheduledAt,
    });

    return mapConsultation(created);
  }

  async getById(context: AuthContext, consultationId: string) {
    const consultation = context.isAdmin
      ? await this.adminRepository.findById(consultationId)
      : await this.repository.findOwnById(consultationId, context.user.id);

    if (!consultation) {
      throw ApiError.notFound("Consultation not found");
    }

    const [historyRows, studentProfile] = await Promise.all([
      context.isAdmin
        ? this.adminRepository.getHistory(consultationId)
        : this.repository.getOwnHistory(consultationId),
      this.adminRepository.getStudentProfile(consultation.student_id),
    ]);

    return {
      ...mapConsultation(consultation),
      studentProfile,
      statusHistory: historyRows.map(mapConsultationHistory),
    };
  }

  async patch(
    context: AuthContext,
    consultationId: string,
    input: { reason?: string; scheduledAt?: string },
  ) {
    this.assertStudentMutationAllowed(context);

    const updated = await this.repository.updateOwn(consultationId, context.user.id, {
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
      ...(input.scheduledAt !== undefined
        ? { scheduled_at: input.scheduledAt }
        : {}),
    });

    if (!updated) {
      throw ApiError.notFound("Consultation not found");
    }

    return mapConsultation(updated);
  }

  async reschedule(
    context: AuthContext,
    consultationId: string,
    input: { scheduledAt: string },
  ) {
    this.assertStudentMutationAllowed(context);

    const updated = await this.repository.updateOwn(consultationId, context.user.id, {
      scheduled_at: input.scheduledAt,
      status: "RESCHEDULED",
      is_completed: false,
      cancelled_at: null,
      cancellation_reason: null,
    });

    if (!updated) {
      throw ApiError.notFound("Consultation not found");
    }

    return mapConsultation(updated);
  }

  async cancel(
    context: AuthContext,
    consultationId: string,
    input: { cancellationReason?: string },
  ) {
    this.assertStudentMutationAllowed(context);

    const updated = await this.repository.updateOwn(consultationId, context.user.id, {
      status: "CANCELLED",
      is_completed: false,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: input.cancellationReason ?? null,
    });

    if (!updated) {
      throw ApiError.notFound("Consultation not found");
    }

    return mapConsultation(updated);
  }

  async toggleComplete(
    context: AuthContext,
    consultationId: string,
    input: { isCompleted: boolean },
  ) {
    this.assertStudentMutationAllowed(context);

    const consultation = await this.repository.findOwnById(
      consultationId,
      context.user.id,
    );

    if (!consultation) {
      throw ApiError.notFound("Consultation not found");
    }

    if (consultation.status === "CANCELLED") {
      throw ApiError.conflict("Cancelled consultations cannot be completed");
    }

    let nextStatus: ConsultationStatus;
    if (input.isCompleted) {
      nextStatus = "COMPLETED";
    } else {
      nextStatus =
        (await this.repository.getLatestNonCompletedStatus(consultationId)) ??
        "SCHEDULED";
    }

    const updated = await this.repository.updateOwn(consultationId, context.user.id, {
      status: nextStatus,
      is_completed: input.isCompleted,
    });

    if (!updated) {
      throw ApiError.notFound("Consultation not found");
    }

    return mapConsultation(updated);
  }
}
