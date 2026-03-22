import { ApiError } from "@/lib/api/errors";
import { AdminRepository } from "./repository";
import { AdminConsultationListQuery } from "@/lib/modules/consultations/schemas";

export class AdminService {
  private readonly repository = new AdminRepository();

  async listConsultations(filters: AdminConsultationListQuery) {
    return this.repository.listConsultations(filters);
  }

  async getConsultationById(consultationId: string) {
    const consultation = await this.repository.getConsultationById(consultationId);

    if (!consultation) {
      throw ApiError.notFound("Consultation not found");
    }

    return consultation;
  }

  async listUsers(input: { page: number; pageSize: number }) {
    return this.repository.listUsers(input);
  }

  async getUserById(userId: string) {
    const user = await this.repository.getUserById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }
}
