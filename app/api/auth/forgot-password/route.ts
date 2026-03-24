import { NextRequest } from "next/server";
import { forgotPasswordController } from "@/lib/modules/auth/controller";

export async function POST(request: NextRequest) {
  return forgotPasswordController(request);
}
