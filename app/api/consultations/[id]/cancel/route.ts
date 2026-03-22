import { NextRequest } from "next/server";
import { cancelConsultationController } from "@/lib/modules/consultations/controller";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return cancelConsultationController(request, await context.params);
}
