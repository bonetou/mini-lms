import { NextRequest } from "next/server";
import { getAdminUserController } from "@/lib/modules/admin/controller";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return getAdminUserController(request, await context.params);
}
