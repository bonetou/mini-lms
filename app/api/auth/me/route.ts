import { NextRequest } from "next/server";
import { meController } from "@/lib/modules/auth/controller";

export async function GET(request: NextRequest) {
  return meController(request);
}
