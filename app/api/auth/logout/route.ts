import { NextRequest } from "next/server";
import { logoutController } from "@/lib/modules/auth/controller";

export async function POST(request: NextRequest) {
  return logoutController(request);
}
