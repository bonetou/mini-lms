import { NextRequest } from "next/server";
import {
  parseJsonBody,
  parseRouteParams,
  parseSearchParams,
  successResponse,
} from "@/lib/api/http";
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

type ConsultationsServiceLike = Pick<
  ConsultationsService,
  "list" | "create" | "getById" | "patch" | "reschedule" | "cancel" | "toggleComplete"
>;

export class ConsultationsController {
  constructor(private readonly service: ConsultationsServiceLike) {}

  async list(request: NextRequest, context: Awaited<ReturnType<typeof requireAuthContext>>) {
    const query = parseSearchParams(
      request.nextUrl.searchParams,
      consultationListQuerySchema,
    );
    const data = await this.service.list(context, query);

    return successResponse(data);
  }

  async create(
    request: NextRequest,
    context: Awaited<ReturnType<typeof requireAuthContext>>,
  ) {
    const body = await parseJsonBody(request, createConsultationBodySchema);
    const data = await this.service.create(context, body);

    return successResponse(data, { status: 201 });
  }

  async getById(
    request: NextRequest,
    context: Awaited<ReturnType<typeof requireAuthContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const data = await this.service.getById(context, id);

    return successResponse(data);
  }

  async patch(
    request: NextRequest,
    context: Awaited<ReturnType<typeof requireAuthContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, patchConsultationBodySchema);
    const data = await this.service.patch(context, id, body);

    return successResponse(data);
  }

  async reschedule(
    request: NextRequest,
    context: Awaited<ReturnType<typeof requireAuthContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, rescheduleConsultationBodySchema);
    const data = await this.service.reschedule(context, id, body);

    return successResponse(data);
  }

  async cancel(
    request: NextRequest,
    context: Awaited<ReturnType<typeof requireAuthContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, cancelConsultationBodySchema);
    const data = await this.service.cancel(context, id, body);

    return successResponse(data);
  }

  async toggleComplete(
    request: NextRequest,
    context: Awaited<ReturnType<typeof requireAuthContext>>,
    params: unknown,
  ) {
    const { id } = parseRouteParams(params, consultationParamsSchema);
    const body = await parseJsonBody(request, toggleCompleteBodySchema);
    const data = await this.service.toggleComplete(context, id, body);

    return successResponse(data);
  }
}

export function parseAdminConsultationFilters(request: NextRequest) {
  return parseSearchParams(
    request.nextUrl.searchParams,
    adminConsultationListQuerySchema,
  );
}
