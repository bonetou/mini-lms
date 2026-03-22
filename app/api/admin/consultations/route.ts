import { NextRequest } from "next/server";
import { listAdminConsultationsController } from "@/lib/modules/admin/controller";

export async function GET(request: NextRequest) {
  return listAdminConsultationsController(request);
}
