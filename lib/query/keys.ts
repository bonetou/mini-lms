import {
  AdminConsultationFilters,
  ConsultationFilters,
} from "@/lib/types/frontend";

export const queryKeys = {
  me: ["me"] as const,
  consultation: (consultationId: string) =>
    ["consultation", consultationId] as const,
  consultationsMine: (filters: ConsultationFilters) =>
    ["consultations", "mine", filters] as const,
  consultationsAdmin: (filters: AdminConsultationFilters) =>
    ["consultations", "admin", filters] as const,
  adminUsers: (filters: { page: number; pageSize: number }) =>
    ["admin", "users", filters] as const,
  adminUser: (userId: string) => ["admin", "user", userId] as const,
};
