import { NextRequest } from "next/server";
import { successResponse, parseJsonBody } from "@/lib/api/http";
import { AuthService } from "./service";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  signUpBodySchema,
  updatePasswordBodySchema,
} from "./schemas";

type AuthServiceLike = Pick<
  AuthService,
  "signUp" | "login" | "logout" | "me" | "forgotPassword" | "updatePassword"
>;

export class AuthController {
  constructor(private readonly service: AuthServiceLike) {}

  async signUp(request: NextRequest) {
    const body = await parseJsonBody(request, signUpBodySchema);
    const data = await this.service.signUp({
      ...body,
      emailRedirectTo: `${request.nextUrl.origin}/dashboard`,
    });

    return successResponse(data, { status: 201 });
  }

  async login(request: NextRequest) {
    const body = await parseJsonBody(request, loginBodySchema);
    const data = await this.service.login(body);

    return successResponse(data);
  }

  async logout() {
    const data = await this.service.logout();

    return successResponse(data);
  }

  async me() {
    const data = await this.service.me();

    return successResponse(data);
  }

  async forgotPassword(request: NextRequest) {
    const body = await parseJsonBody(request, forgotPasswordBodySchema);
    const data = await this.service.forgotPassword({
      ...body,
      redirectTo: `${request.nextUrl.origin}/auth/update-password`,
    });

    return successResponse(data);
  }

  async updatePassword(request: NextRequest) {
    const body = await parseJsonBody(request, updatePasswordBodySchema);
    const data = await this.service.updatePassword(body);

    return successResponse(data);
  }
}
