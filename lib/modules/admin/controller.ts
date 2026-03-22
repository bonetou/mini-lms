import { NextRequest } from "next/server";
import {
  parseRouteParams,
  parseSearchParams,
  successResponse,
  errorResponse,
} from "@/lib/api/http";
import { requireAdminContext } from "@/lib/api/auth-context";
import { AdminService } from "./service";
import {
  adminConsultationListQuerySchema,
  adminConsultationParamsSchema,
  adminUserParamsSchema,
  adminUsersListQuerySchema,
} from "./schemas";

export async function listAdminConsultationsController(request: NextRequest) {
  try {
    const context = await requireAdminContext(request);
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      adminConsultationListQuerySchema,
    );
    const service = new AdminService();
    const data = await service.listConsultations(query);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getAdminConsultationController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAdminContext(request);
    const { id } = parseRouteParams(params, adminConsultationParamsSchema);
    const service = new AdminService();
    const data = await service.getConsultationById(id);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function listAdminUsersController(request: NextRequest) {
  try {
    const context = await requireAdminContext(request);
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      adminUsersListQuerySchema,
    );
    const service = new AdminService();
    const data = await service.listUsers(query);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getAdminUserController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAdminContext(request);
    const { id } = parseRouteParams(params, adminUserParamsSchema);
    const service = new AdminService();
    const data = await service.getUserById(id);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}
