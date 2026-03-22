import { NextRequest } from "next/server";
import { toggleCompleteConsultationController } from "@/lib/modules/consultations/controller";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return toggleCompleteConsultationController(request, await context.params);
}
