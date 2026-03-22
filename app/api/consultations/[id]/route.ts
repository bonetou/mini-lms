import { NextRequest } from "next/server";
import {
  getConsultationController,
  patchConsultationController,
} from "@/lib/modules/consultations/controller";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return getConsultationController(request, await context.params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return patchConsultationController(request, await context.params);
}
