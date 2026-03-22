import { NextRequest } from "next/server";
import {
  parseJsonBody,
  parseRouteParams,
  parseSearchParams,
  successResponse,
} from "@/lib/api/http";
import { errorResponse } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/api/auth-context";
import {
  adminConsultationListQuerySchema,
  cancelConsultationBodySchema,
  consultationListQuerySchema,
  consultationParamsSchema,
  createConsultationBodySchema,
  patchConsultationBodySchema,
  rescheduleConsultationBodySchema,
  toggleCompleteBodySchema,
} from "./schemas";
import { ConsultationsService } from "./service";

export async function listConsultationsController(request: NextRequest) {
  try {
    const context = await requireAuthContext(request);
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      consultationListQuerySchema,
    );
    const service = new ConsultationsService(context);
    const data = await service.list(context, query);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function createConsultationController(request: NextRequest) {
  try {
    const context = await requireAuthContext(request);
    const body = await parseJsonBody(request, createConsultationBodySchema);
    const service = new ConsultationsService(context);
    const data = await service.create(context, body);

    return context.routeClient.applyCookies(
      successResponse(data, { status: 201 }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getConsultationController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAuthContext(request);
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const service = new ConsultationsService(context);
    const data = await service.getById(context, id);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function patchConsultationController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAuthContext(request);
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, patchConsultationBodySchema);
    const service = new ConsultationsService(context);
    const data = await service.patch(context, id, body);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function rescheduleConsultationController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAuthContext(request);
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, rescheduleConsultationBodySchema);
    const service = new ConsultationsService(context);
    const data = await service.reschedule(context, id, body);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function cancelConsultationController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAuthContext(request);
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, cancelConsultationBodySchema);
    const service = new ConsultationsService(context);
    const data = await service.cancel(context, id, body);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function toggleCompleteConsultationController(
  request: NextRequest,
  params: unknown,
) {
  try {
    const context = await requireAuthContext(request);
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, toggleCompleteBodySchema);
    const service = new ConsultationsService(context);
    const data = await service.toggleComplete(context, id, body);

    return context.routeClient.applyCookies(successResponse(data));
  } catch (error) {
    return errorResponse(error);
  }
}

export function parseAdminConsultationFilters(request: NextRequest) {
  return parseSearchParams(
    request.nextUrl.searchParams,
    adminConsultationListQuerySchema,
  );
}
