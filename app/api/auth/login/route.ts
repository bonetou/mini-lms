import { NextRequest } from "next/server";
import { loginController } from "@/lib/modules/auth/controller";

export async function POST(request: NextRequest) {
  return loginController(request);
}
