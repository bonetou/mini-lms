import { NextRequest } from "next/server";
import { signUpController } from "@/lib/modules/auth/controller";

export async function POST(request: NextRequest) {
  return signUpController(request);
}
