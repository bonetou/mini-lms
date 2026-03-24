import { NextRequest } from "next/server";
import { requireAuthContext } from "@/lib/api/auth-context";
import { errorResponse } from "@/lib/api/http";
import { ConsultationsController } from "@/lib/modules/consultations/controller";
import { ConsultationsRepository } from "@/lib/modules/consultations/repository";
import { ConsultationsService } from "@/lib/modules/consultations/service";

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuthContext(request);
    const repository = new ConsultationsRepository(context.routeClient.supabase);
    const service = new ConsultationsService(repository);
    const controller = new ConsultationsController(service);

    return context.routeClient.applyCookies(await controller.list(request, context));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requireAuthContext(request);
    const repository = new ConsultationsRepository(context.routeClient.supabase);
    const service = new ConsultationsService(repository);
    const controller = new ConsultationsController(service);

    return context.routeClient.applyCookies(await controller.create(request, context));
  } catch (error) {
    return errorResponse(error);
  }
}
