import { NextRequest } from "next/server";
import { successResponse, parseJsonBody } from "@/lib/api/http";
import { withApiHandler } from "@/lib/api/auth-context";
import { AuthService } from "./service";
import { loginBodySchema, signUpBodySchema } from "./schemas";

export async function signUpController(request: NextRequest) {
  return withApiHandler(request, async (routeClient) => {
    const body = await parseJsonBody(request, signUpBodySchema);
    const service = new AuthService(routeClient.supabase);
    const data = await service.signUp({
      ...body,
      emailRedirectTo: `${request.nextUrl.origin}/dashboard`,
    });

    return successResponse(data, { status: 201 });
  });
}

export async function loginController(request: NextRequest) {
  return withApiHandler(request, async (routeClient) => {
    const body = await parseJsonBody(request, loginBodySchema);
    const service = new AuthService(routeClient.supabase);
    const data = await service.login(body);

    return successResponse(data);
  });
}

export async function logoutController(request: NextRequest) {
  return withApiHandler(request, async (routeClient) => {
    const service = new AuthService(routeClient.supabase);
    const data = await service.logout();

    return successResponse(data);
  });
}

export async function meController(request: NextRequest) {
  return withApiHandler(request, async (routeClient) => {
    const service = new AuthService(routeClient.supabase);
    const data = await service.me();

    return successResponse(data);
  });
}
