import { NextRequest } from "next/server";
import { listAdminUsersController } from "@/lib/modules/admin/controller";

export async function GET(request: NextRequest) {
  return listAdminUsersController(request);
}
