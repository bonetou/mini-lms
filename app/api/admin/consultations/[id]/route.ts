import { NextRequest } from "next/server";
import { requireAdminContext } from "@/lib/api/auth-context";
import { errorResponse } from "@/lib/api/http";
import { AdminController } from "@/lib/modules/admin/controller";
import { AdminRepository } from "@/lib/modules/admin/repository";
import { AdminService } from "@/lib/modules/admin/service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const adminContext = await requireAdminContext(request);
    const repository = new AdminRepository();
    const service = new AdminService(repository);
    const controller = new AdminController(service);

    return adminContext.routeClient.applyCookies(
      await controller.getConsultationById(request, adminContext, await context.params),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
