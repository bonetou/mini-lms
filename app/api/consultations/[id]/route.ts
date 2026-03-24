import { NextRequest } from "next/server";
import { requireAuthContext } from "@/lib/api/auth-context";
import { errorResponse } from "@/lib/api/http";
import { ConsultationsController } from "@/lib/modules/consultations/controller";
import { ConsultationsRepository } from "@/lib/modules/consultations/repository";
import { ConsultationsService } from "@/lib/modules/consultations/service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await requireAuthContext(request);
    const repository = new ConsultationsRepository(authContext.routeClient.supabase);
    const service = new ConsultationsService(repository);
    const controller = new ConsultationsController(service);

    return authContext.routeClient.applyCookies(
      await controller.getById(request, authContext, await context.params),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await requireAuthContext(request);
    const repository = new ConsultationsRepository(authContext.routeClient.supabase);
    const service = new ConsultationsService(repository);
    const controller = new ConsultationsController(service);

    return authContext.routeClient.applyCookies(
      await controller.patch(request, authContext, await context.params),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
