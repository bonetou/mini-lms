import { NextRequest } from "next/server";
import {
  parseRouteParams,
  parseSearchParams,
  successResponse,
} from "@/lib/api/http";
import { requireAdminContext } from "@/lib/api/auth-context";
import { AdminService } from "./service";
import {
  adminConsultationListQuerySchema,
  adminConsultationParamsSchema,
  adminUserParamsSchema,
  adminUsersListQuerySchema,
} from "./schemas";

type AdminServiceLike = Pick<
  AdminService,
  "listConsultations" | "getConsultationById" | "listUsers" | "getUserById"
>;

export class AdminController {
  constructor(private readonly service: AdminServiceLike) {}

  async listConsultations(
    request: NextRequest,
  ) {
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      adminConsultationListQuerySchema,
    );
    const data = await this.service.listConsultations(query);

    return successResponse(data);
  }

  async getConsultationById(
    _request: NextRequest,
    _context: Awaited<ReturnType<typeof requireAdminContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, adminConsultationParamsSchema);
    const data = await this.service.getConsultationById(id);

    return successResponse(data);
  }

  async listUsers(
    request: NextRequest,
  ) {
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      adminUsersListQuerySchema,
    );
    const data = await this.service.listUsers(query);

    return successResponse(data);
  }

  async getUserById(
    _request: NextRequest,
    _context: Awaited<ReturnType<typeof requireAdminContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, adminUserParamsSchema);
    const data = await this.service.getUserById(id);

    return successResponse(data);
  }
}
