import { NextRequest } from "next/server";
import { updatePasswordController } from "@/lib/modules/auth/controller";

export async function POST(request: NextRequest) {
  return updatePasswordController(request);
}
