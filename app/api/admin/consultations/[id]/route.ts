import { NextRequest } from "next/server";
import { getAdminConsultationController } from "@/lib/modules/admin/controller";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return getAdminConsultationController(request, await context.params);
}
