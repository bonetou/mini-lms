import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AdminConsultationListQuery,
  ConsultationListQuery,
  ConsultationStatus,
} from "./schemas";

const consultationColumns = [
  "id",
  "student_id",
  "student_first_name",
  "student_last_name",
  "reason",
  "scheduled_at",
  "status",
  "is_completed",
  "cancelled_at",
  "cancellation_reason",
  "created_at",
  "updated_at",
].join(",");

const historyColumns = [
  "id",
  "consultation_id",
  "changed_by_user_id",
  "from_status",
  "to_status",
  "notes",
  "created_at",
].join(",");

type ConsultationRow = {
  id: string;
  student_id: string;
  student_first_name: string;
  student_last_name: string;
  reason: string;
  scheduled_at: string;
  status: ConsultationStatus;
  is_completed: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
};

type ConsultationHistoryRow = {
  id: string;
  consultation_id: string;
  changed_by_user_id: string;
  from_status: ConsultationStatus | null;
  to_status: ConsultationStatus;
  notes: string | null;
  created_at: string;
};

type ConsultationListResult = {
  rows: ConsultationRow[];
  count: number;
};

export function mapConsultation(row: ConsultationRow) {
  return {
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
  };
}

export function mapConsultationHistory(row: ConsultationHistoryRow) {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    changedByUserId: row.changed_by_user_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export class ConsultationsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listOwn(studentId: string, filters: ConsultationListQuery) {
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    let query = this.supabase
      .from("consultations")
      .select(consultationColumns, { count: "exact" })
      .eq("student_id", studentId)
      .order("scheduled_at", { ascending: true })
      .range(from, to);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.scheduledFrom) {
      query = query.gte("scheduled_at", filters.scheduledFrom);
    }

    if (filters.scheduledTo) {
      query = query.lte("scheduled_at", filters.scheduledTo);
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    return {
      rows: (result.data ?? []) as unknown as ConsultationRow[],
      count: result.count ?? 0,
    } satisfies ConsultationListResult;
  }

  async create(input: {
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    reason: string;
    scheduledAt: string;
  }) {
    const result = await this.supabase
      .from("consultations")
      .insert({
        student_id: input.studentId,
        student_first_name: input.studentFirstName,
        student_last_name: input.studentLastName,
        reason: input.reason,
        scheduled_at: input.scheduledAt,
        status: "SCHEDULED",
        is_completed: false,
      })
      .select(consultationColumns)
      .single();

    if (result.error) {
      throw result.error;
    }

    return result.data as unknown as ConsultationRow;
  }

  async findOwnById(consultationId: string, studentId: string) {
    const result = await this.supabase
      .from("consultations")
      .select(consultationColumns)
      .eq("id", consultationId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return (result.data as ConsultationRow | null) ?? null;
  }

  async getOwnHistory(consultationId: string) {
    const result = await this.supabase
      .from("consultation_status_history")
      .select(historyColumns)
      .eq("consultation_id", consultationId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw result.error;
    }

    return (result.data ?? []) as unknown as ConsultationHistoryRow[];
  }

  async getLatestNonCompletedStatus(consultationId: string) {
    const result = await this.supabase
      .from("consultation_status_history")
      .select("to_status")
      .eq("consultation_id", consultationId)
      .neq("to_status", "COMPLETED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return (result.data?.to_status as ConsultationStatus | undefined) ?? null;
  }

  async updateOwn(
    consultationId: string,
    studentId: string,
    input: Record<string, unknown>,
  ) {
    const result = await this.supabase
      .from("consultations")
      .update(input)
      .eq("id", consultationId)
      .eq("student_id", studentId)
      .select(consultationColumns)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return (result.data as ConsultationRow | null) ?? null;
  }
}

export class ConsultationsAdminRepository {
  private readonly supabase = createAdminClient();

  async listAll(filters: AdminConsultationListQuery) {
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    let query = this.supabase
      .from("consultations")
      .select(consultationColumns, { count: "exact" })
      .order("scheduled_at", { ascending: true })
      .range(from, to);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.studentId) {
      query = query.eq("student_id", filters.studentId);
    }

    if (filters.scheduledFrom) {
      query = query.gte("scheduled_at", filters.scheduledFrom);
    }

    if (filters.scheduledTo) {
      query = query.lte("scheduled_at", filters.scheduledTo);
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    return {
      rows: (result.data ?? []) as unknown as ConsultationRow[],
      count: result.count ?? 0,
    } satisfies ConsultationListResult;
  }

  async findById(consultationId: string) {
    const result = await this.supabase
      .from("consultations")
      .select(consultationColumns)
      .eq("id", consultationId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return (result.data as ConsultationRow | null) ?? null;
  }

  async getHistory(consultationId: string) {
    const result = await this.supabase
      .from("consultation_status_history")
      .select(historyColumns)
      .eq("consultation_id", consultationId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw result.error;
    }

    return (result.data ?? []) as unknown as ConsultationHistoryRow[];
  }

  async getStudentProfile(studentId: string) {
    const result = await this.supabase
      .from("profiles")
      .select("id,email,first_name,last_name,created_at,updated_at")
      .eq("id", studentId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      return null;
    }

    return {
      id: result.data.id,
      email: result.data.email,
      firstName: result.data.first_name,
      lastName: result.data.last_name,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at,
    };
  }
}
