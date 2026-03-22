import { createAdminClient } from "@/lib/supabase/admin";
import { extractRoleName } from "@/lib/api/roles";
import {
  ConsultationsAdminRepository,
  mapConsultation,
  mapConsultationHistory,
} from "@/lib/modules/consultations/repository";
import { AdminConsultationListQuery } from "@/lib/modules/consultations/schemas";

export class AdminRepository {
  private readonly supabase = createAdminClient();
  private readonly consultationsRepository = new ConsultationsAdminRepository();

  async listConsultations(filters: AdminConsultationListQuery) {
    const result = await this.consultationsRepository.listAll(filters);

    return {
      items: result.rows.map(mapConsultation),
      total: result.count,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async getConsultationById(consultationId: string) {
    const consultation = await this.consultationsRepository.findById(consultationId);

    if (!consultation) {
      return null;
    }

    const [historyRows, studentProfile] = await Promise.all([
      this.consultationsRepository.getHistory(consultationId),
      this.consultationsRepository.getStudentProfile(consultation.student_id),
    ]);

    return {
      ...mapConsultation(consultation),
      studentProfile,
      statusHistory: historyRows.map(mapConsultationHistory),
    };
  }

  async listUsers(input: { page: number; pageSize: number }) {
    const from = (input.page - 1) * input.pageSize;
    const to = from + input.pageSize - 1;
    const profileResult = await this.supabase
      .from("profiles")
      .select("id,email,first_name,last_name,created_at,updated_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (profileResult.error) {
      throw profileResult.error;
    }

    const profiles = profileResult.data ?? [];
    const userIds = profiles.map((profile) => profile.id);

    const rolesResult =
      userIds.length > 0
        ? await this.supabase
            .from("user_roles")
            .select("user_id,role:roles(name)")
            .in("user_id", userIds)
        : { data: [], error: null };

    if (rolesResult.error) {
      throw rolesResult.error;
    }

    const rolesByUserId = new Map<string, string[]>();
    rolesResult.data.forEach((entry) => {
      const currentRoles = rolesByUserId.get(entry.user_id) ?? [];
      const roleName = extractRoleName(entry.role);

      if (roleName) {
        currentRoles.push(roleName);
      }

      rolesByUserId.set(entry.user_id, currentRoles);
    });

    return {
      items: profiles.map((profile) => ({
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        roles: rolesByUserId.get(profile.id) ?? [],
      })),
      total: profileResult.count ?? 0,
      page: input.page,
      pageSize: input.pageSize,
    };
  }

  async getUserById(userId: string) {
    const profileResult = await this.supabase
      .from("profiles")
      .select("id,email,first_name,last_name,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (!profileResult.data) {
      return null;
    }

    const [rolesResult, consultationsCountResult] = await Promise.all([
      this.supabase
        .from("user_roles")
        .select("role:roles(name)")
        .eq("user_id", userId),
      this.supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId),
    ]);

    if (rolesResult.error) {
      throw rolesResult.error;
    }

    if (consultationsCountResult.error) {
      throw consultationsCountResult.error;
    }

    return {
      id: profileResult.data.id,
      email: profileResult.data.email,
      firstName: profileResult.data.first_name,
      lastName: profileResult.data.last_name,
      createdAt: profileResult.data.created_at,
      updatedAt: profileResult.data.updated_at,
      roles: rolesResult.data
        .map((entry) => extractRoleName(entry.role))
        .filter((role): role is string => Boolean(role)),
      consultationCount: consultationsCountResult.count ?? 0,
    };
  }
}
