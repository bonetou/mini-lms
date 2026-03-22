import { NextRequest } from "next/server";
import { rescheduleConsultationController } from "@/lib/modules/consultations/controller";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return rescheduleConsultationController(request, await context.params);
}
